import "server-only";

import { createWriteStream } from "node:fs";
import { mkdir, unlink, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { installationDocument } from "./db/schema";
import { logAudit, userCanViewInstallation } from "./installations";
import type { UserRole } from "./constants";
import { DOCUMENT_KINDS, formatSizeLimit, maxBytesForKind } from "./documents-ui";
import { userHasAsceProForInstallation } from "./asce-pro";
import {
  asceDocumentKinds,
  geranceDocumentKinds,
  getAccountPlan,
  isPro,
} from "./plans";
import { userIsInvitedOnInstallation } from "./tenders";

export const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024 * 1024;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]["value"];

const UPLOAD_ROOT = join(process.cwd(), "data", "uploads");

function kindFromValue(value: FormDataEntryValue | null): DocumentKind {
  const text = String(value ?? "autre");
  return DOCUMENT_KINDS.some((item) => item.value === text)
    ? (text as DocumentKind)
    : "autre";
}

function findJpegStart(buffer: Buffer) {
  const limit = Math.min(buffer.length - 2, 4096);
  for (let i = 0; i < limit; i++) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd8 && buffer[i + 2] === 0xff) {
      return i;
    }
  }
  return -1;
}

function sliceJpeg(buffer: Buffer, start: number) {
  for (let i = buffer.length - 2; i > start + 2; i--) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd9) {
      return buffer.subarray(start, i + 2);
    }
  }
  return buffer.subarray(start);
}

function detectFile(buffer: Buffer, fileName = "") {
  const name = fileName.toLowerCase();
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { mimeType: "application/pdf", extension: "pdf", family: "pdf" as const };
  }
  const jpegStart = findJpegStart(buffer);
  if (name.endsWith(".insp") && jpegStart >= 0) {
    return {
      mimeType: "image/jpeg",
      extension: "jpg",
      family: "image" as const,
      payload: sliceJpeg(buffer, jpegStart),
    };
  }
  if (jpegStart === 0) {
    return { mimeType: "image/jpeg", extension: "jpg", family: "image" as const };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { mimeType: "image/png", extension: "png", family: "image" as const };
  }
  const head = buffer.subarray(0, 6).toString("ascii");
  if (head.startsWith("AC10") || name.endsWith(".dwg")) {
    return { mimeType: "application/acad", extension: "dwg", family: "dwg" as const };
  }
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (name.endsWith(".insv")) {
      return { mimeType: "video/mp4", extension: "mp4", family: "video" as const };
    }
    if (brand.startsWith("qt")) {
      return { mimeType: "video/quicktime", extension: "mov", family: "video" as const };
    }
    return { mimeType: "video/mp4", extension: "mp4", family: "video" as const };
  }
  if (name.endsWith(".insv")) {
    return { mimeType: "video/mp4", extension: "mp4", family: "video" as const };
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { mimeType: "video/webm", extension: "webm", family: "video" as const };
  }
  if (name.endsWith(".mp4")) {
    return { mimeType: "video/mp4", extension: "mp4", family: "video" as const };
  }
  if (name.endsWith(".mov")) {
    return { mimeType: "video/quicktime", extension: "mov", family: "video" as const };
  }
  if (name.endsWith(".webm")) {
    return { mimeType: "video/webm", extension: "webm", family: "video" as const };
  }
  return null;
}

function kindAllowsFamily(
  kind: DocumentKind,
  family: "pdf" | "image" | "dwg" | "video",
) {
  if (kind === "plan") return family === "pdf" || family === "dwg";
  if (kind === "photo" || kind === "photo360") return family === "image";
  if (kind === "video") return family === "video";
  return family !== "video";
}

export function documentPath(storedName: string) {
  return join(UPLOAD_ROOT, storedName);
}

export async function listDocuments(installationId: string) {
  return db
    .select()
    .from(installationDocument)
    .where(eq(installationDocument.installationId, installationId))
    .orderBy(desc(installationDocument.createdAt));
}

export async function getDocumentById(id: string) {
  const [row] = await db
    .select()
    .from(installationDocument)
    .where(eq(installationDocument.id, id))
    .limit(1);
  return row ?? null;
}

export async function userCanAccessDocument(
  role: UserRole,
  userId: string,
  installationId: string,
  kind: string,
  mimeType?: string,
) {
  if (role === "admin") return true;
  const { plan } = await getAccountPlan(userId);
  const pro =
    role === "ascensoriste"
      ? await userHasAsceProForInstallation(userId, installationId)
      : isPro(role, plan);
  if (!pro && role === "ascensoriste") return false;

  if (role === "gerance") {
    const assigned = await userCanViewInstallation(role, userId, installationId);
    if (!assigned) return false;
    return (geranceDocumentKinds(pro) as readonly string[]).includes(kind);
  }

  if (role === "ascensoriste") {
    const invited = await userIsInvitedOnInstallation(userId, installationId);
    if (!invited) return false;
    return (asceDocumentKinds(pro) as readonly string[]).includes(kind);
  }

  return false;
}

export function filterDocumentsForRole<T extends { kind: string; mimeType?: string }>(
  role: UserRole,
  pro: boolean,
  documents: T[],
) {
  if (role === "admin") return documents;
  const allowed =
    role === "gerance"
      ? geranceDocumentKinds(pro)
      : role === "ascensoriste"
        ? asceDocumentKinds(pro)
        : [];
  if (!pro && role !== "gerance") return [];
  return documents.filter((item) =>
    (allowed as readonly string[]).includes(item.kind),
  );
}

export async function saveDocument(input: {
  installationId: string;
  actorId: string;
  file: File;
  kind: FormDataEntryValue | null;
}) {
  const kind = kindFromValue(input.kind);
  if (!input.file || input.file.size === 0) {
    return { error: "Choisissez un fichier." };
  }
  const limit = maxBytesForKind(kind);
  if (input.file.size > limit) {
    return {
      error: `Le fichier dépasse ${formatSizeLimit(limit)}.`,
    };
  }
  const large = input.file.size > 80 * 1024 * 1024;
  const sample = Buffer.from(
    await input.file.slice(0, large ? 65_536 : input.file.size).arrayBuffer(),
  );
  const detected = detectFile(sample, input.file.name);
  if (!detected) {
    if (input.file.name.toLowerCase().endsWith(".insp")) {
      return {
        error:
          "Ce fichier INSP n’a pas pu être lu. Déposez le fichier .insp d’origine, ou exportez-le depuis Insta360.",
      };
    }
    return { error: "Formats acceptés : PDF, DWG, INSP, INSV, JPG, PNG, MP4, MOV et WebM." };
  }
  if (kind === "video") {
    const name = input.file.name.toLowerCase();
    if (
      detected.extension !== "mp4" ||
      name.endsWith(".insv") ||
      name.endsWith(".mov") ||
      name.endsWith(".webm")
    ) {
      return { error: "Les vidéos 360° doivent être en MP4." };
    }
  }
  if (!kindAllowsFamily(kind, detected.family)) {
    if (kind === "plan") return { error: "Les plans doivent être en PDF ou DWG." };
    if (kind === "video")
      return { error: "Les vidéos 360° doivent être en MP4." };
    if (kind === "photo360") {
      return { error: "Les photos 360° doivent être en INSP, JPG ou PNG." };
    }
    if (kind === "photo") {
      return { error: "Les photos doivent être en JPG ou PNG." };
    }
    return { error: "Ce format ne correspond pas au type choisi." };
  }

  const id = crypto.randomUUID();
  const storedName = `${input.installationId}/${id}.${detected.extension}`;
  const directory = join(UPLOAD_ROOT, input.installationId);
  await mkdir(directory, { recursive: true });
  const dest = join(UPLOAD_ROOT, storedName);
  const extracted = "payload" in detected ? detected.payload : undefined;
  if (extracted) {
    await writeFile(dest, extracted);
  } else if (large) {
    await pipeline(
      Readable.fromWeb(input.file.stream() as never),
      createWriteStream(dest),
    );
  } else {
    await writeFile(dest, sample);
  }

  await db.insert(installationDocument).values({
    id,
    installationId: input.installationId,
    originalName: input.file.name.replace(/[/\\]/g, "_").slice(0, 180) || `document.${detected.extension}`,
    storedName,
    mimeType: detected.mimeType,
    sizeBytes: extracted ? extracted.length : input.file.size,
    kind,
    uploadedBy: input.actorId,
    createdAt: new Date(),
  });
  await logAudit(input.actorId, "document-upload", input.installationId, input.file.name);
  return { error: "" };
}

export async function removeDocument(id: string, actorId: string) {
  const row = await getDocumentById(id);
  if (!row) return;
  await db.delete(installationDocument).where(eq(installationDocument.id, id));
  await unlink(documentPath(row.storedName)).catch(() => undefined);
  await logAudit(actorId, "document-delete", row.installationId, row.originalName);
}

export async function removeInstallationFiles(installationId: string) {
  await rm(join(UPLOAD_ROOT, installationId), { recursive: true, force: true });
}
