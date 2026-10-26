import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { clientRequest } from "./db/schema";
import {
  detectKindFromText,
  extractFromText,
  fieldsFromUnknown,
  hasUsefulFields,
  interpretPurchaseOrder,
  kindFromUnknown,
  mergeFields,
} from "./purchase-order-extract";
import {
  EMPTY_PURCHASE_ORDER_FIELDS,
  type PurchaseOrderFields,
} from "./purchase-order-ui";

export type { PurchaseOrderFields };

export const MAX_PURCHASE_ORDER_BYTES = 20 * 1024 * 1024;

const EMPTY_FIELDS = EMPTY_PURCHASE_ORDER_FIELDS;

function detectOrderFile(buffer: Buffer, fileName = "") {
  const name = fileName.toLowerCase();
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { mimeType: "application/pdf", extension: "pdf" };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (name.endsWith(".pdf")) {
    return { mimeType: "application/pdf", extension: "pdf" };
  }
  if (name.endsWith(".png")) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  return null;
}

function roughPdfText(buffer: Buffer) {
  const raw = buffer.toString("latin1");
  const parts: string[] = [];
  const matches = raw.matchAll(/\((?:\\.|[^\\)]){2,}\)/g);
  for (const match of matches) {
    const value = match[0]
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, " ")
      .replace(/\\\)/g, ")")
      .replace(/\\\(/g, "(");
    if (/[A-Za-zÀ-ÿ]{3,}/.test(value)) parts.push(value);
  }
  return parts.join("\n");
}

async function extractPdfText(buffer: Buffer) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
      join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
    ).href;
    const task = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await task.promise;
    const pages = Math.min(pdf.numPages, 4);
    const chunks: string[] = [];
    for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: { y: number; text: string }[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const y =
          "transform" in item && Array.isArray(item.transform)
            ? Math.round(Number(item.transform[5]) || 0)
            : 0;
        const last = lines.at(-1);
        if (last && Math.abs(last.y - y) <= 2) {
          last.text += `${last.text.endsWith(" ") ? "" : " "}${item.str}`;
        } else {
          lines.push({ y, text: item.str });
        }
      }
      chunks.push(lines.map((line) => line.text).join("\n"));
    }
    const text = chunks.join("\n").trim();
    return text || roughPdfText(buffer);
  } catch (error) {
    console.error("[bon de commande] PDF", error);
    return roughPdfText(buffer);
  }
}

const EXTRACT_PROMPT = `Tu lis un bon de commande suisse (gérance / immeuble / ascenseur).
Extrais uniquement les champs JSON suivants, sans inventer :
{
  "kind": "tender | audit | repair | other",
  "street": "nom de rue de l'immeuble concerné",
  "number": "numéro de rue",
  "npa": "NPA à 4 chiffres",
  "locality": "localité",
  "access": "indications d'accès si présentes",
  "orderNumber": "numéro du bon de commande",
  "object": "objet / prestation",
  "notes": "autres infos utiles (contact, dates, montant, immeuble)"
}
kind : tender = appel d'offres / remplacement / modernisation / cahier des charges ;
audit = audit ou contrôle ; repair = réparation ou panne ; other = question ou autre.
Si un champ texte est absent, mets une chaîne vide. Réponds uniquement en JSON.`;

async function extractWithOpenAi(input: {
  text?: string;
  image?: { mimeType: string; base64: string };
}) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const userContent = input.image
    ? [
        { type: "text" as const, text: EXTRACT_PROMPT },
        {
          type: "image_url" as const,
          image_url: {
            url: `data:${input.image.mimeType};base64,${input.image.base64}`,
          },
        },
      ]
    : `${EXTRACT_PROMPT}\n\nDocument :\n${(input.text ?? "").slice(0, 14000)}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Tu extrais des informations de bons de commande. Tu ne fabriques aucune donnée.",
        },
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Lecture IA impossible (${response.status}). ${detail.slice(0, 180)}`);
  }
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return { fields: EMPTY_FIELDS, kind: "tender" as const };
  }
  try {
    const parsed = JSON.parse(content) as unknown;
    return {
      fields: fieldsFromUnknown(parsed),
      kind: kindFromUnknown(parsed, input.text ?? ""),
    };
  } catch {
    return { fields: EMPTY_FIELDS, kind: "tender" as const };
  }
}

export async function interpretPurchaseOrderContent(input: {
  text: string;
  image?: { mimeType: string; base64: string };
}) {
  const heuristic = input.text.trim()
    ? interpretPurchaseOrder(input.text)
    : { fields: EMPTY_FIELDS, kind: "tender" as const };
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (hasKey && (input.text.trim() || input.image)) {
    try {
      const extracted = await extractWithOpenAi({
        text: input.text,
        image: input.image,
      });
      if (extracted) {
        const fields = mergeFields(extracted.fields, heuristic.fields);
        return {
          ok: true as const,
          fields,
          kind: extracted.kind || heuristic.kind,
          usedAi: true as const,
          warning: hasUsefulFields(fields)
            ? undefined
            : "Peu d’informations ont été lues. Vérifiez les champs.",
        };
      }
    } catch (error) {
      console.error("[bon de commande] IA", error);
    }
  }
  return {
    ok: true as const,
    fields: heuristic.fields,
    kind: heuristic.kind,
    usedAi: false as const,
    warning: hasUsefulFields(heuristic.fields)
      ? undefined
      : input.image && !hasKey
        ? "Pour lire une photo, une clé OPENAI_API_KEY est nécessaire. Déposez plutôt le PDF."
        : undefined,
  };
}

export async function readPurchaseOrderFile(file: File) {
  if (!file.size) {
    return { ok: false as const, error: "Aucun fichier reçu." };
  }
  if (file.size > MAX_PURCHASE_ORDER_BYTES) {
    return { ok: false as const, error: "Le bon de commande dépasse 20 Mo." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectOrderFile(buffer, file.name);
  if (!detected) {
    return {
      ok: false as const,
      error: "Joignez un PDF, un JPEG ou un PNG.",
    };
  }

  let text = "";
  if (detected.mimeType === "application/pdf") {
    try {
      text = await extractPdfText(buffer);
    } catch (error) {
      console.error("[bon de commande] PDF", error);
      return {
        ok: false as const,
        error: "Impossible de lire ce PDF.",
      };
    }
  }

  const heuristic = text ? extractFromText(text) : { ...EMPTY_FIELDS };
  const heuristicKind = detectKindFromText(`${file.name}\n${text}\n${heuristic.object}`);
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());

  try {
    if (detected.mimeType !== "application/pdf") {
      if (!hasKey) {
        return {
          ok: true as const,
          fields: EMPTY_FIELDS,
          kind: "tender" as const,
          warning:
            "Pour lire une photo du bon, ajoutez OPENAI_API_KEY dans .env.local. Vous pouvez remplir les champs à la main.",
        };
      }
      const extracted = await extractWithOpenAi({
        image: {
          mimeType: detected.mimeType,
          base64: buffer.toString("base64"),
        },
      });
      const fields = extracted?.fields ?? EMPTY_FIELDS;
      return {
        ok: true as const,
        fields,
        kind: extracted?.kind ?? "tender",
        warning: hasUsefulFields(fields)
          ? undefined
          : "Peu d’informations ont été lues. Vérifiez les champs.",
      };
    }

    if (hasKey && text.trim()) {
      const extracted = await extractWithOpenAi({ text });
      const merged = { ...heuristic };
      for (const key of Object.keys(EMPTY_FIELDS) as (keyof PurchaseOrderFields)[]) {
        merged[key] = (extracted?.fields[key] || heuristic[key] || "").trim();
      }
      return {
        ok: true as const,
        fields: merged,
        kind: extracted?.kind ?? heuristicKind,
        warning: hasUsefulFields(merged)
          ? undefined
          : "Peu d’informations ont été lues. Vérifiez les champs.",
      };
    }
  } catch (error) {
    console.error("[bon de commande] IA", error);
    if (!text.trim()) {
      return {
        ok: false as const,
        error: "La lecture automatique a échoué. Remplissez les champs ou réessayez.",
      };
    }
  }

  if (!text.trim()) {
    return {
      ok: true as const,
      fields: EMPTY_FIELDS,
      kind: heuristicKind,
      warning:
        "Ce PDF ne contient pas de texte lisible (scan). Ajoutez OPENAI_API_KEY pour la lecture automatique, ou remplissez les champs.",
    };
  }

  return {
    ok: true as const,
    fields: heuristic,
    kind: heuristicKind,
    warning: hasUsefulFields(heuristic)
      ? undefined
      : "Peu d’informations ont été lues. Vérifiez les champs.",
  };
}

export async function saveRequestPurchaseOrder(requestId: string, file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectOrderFile(buffer, file.name);
  if (!detected) return { ok: false as const, error: "Fichier non accepté." };
  if (buffer.length > MAX_PURCHASE_ORDER_BYTES) {
    return { ok: false as const, error: "Le bon de commande dépasse 20 Mo." };
  }
  const storedName = `request-${requestId}-bon.${detected.extension}`;
  const folder = join(process.cwd(), "data", "uploads");
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, storedName), buffer);
  await db
    .update(clientRequest)
    .set({
      purchaseOrderName: file.name,
      purchaseOrderStored: storedName,
      purchaseOrderMime: detected.mimeType,
    })
    .where(eq(clientRequest.id, requestId));
  return { ok: true as const };
}

export function purchaseOrderPath(storedName: string) {
  return join(process.cwd(), "data", "uploads", storedName);
}
