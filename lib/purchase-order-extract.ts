import {
  EMPTY_PURCHASE_ORDER_FIELDS,
  type PurchaseOrderFields,
} from "./purchase-order-ui";
import { isRequestKind, type RequestKind } from "./requests-ui";

export function clean(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fieldsFromUnknown(raw: unknown): PurchaseOrderFields {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    street: clean(data.street),
    number: clean(data.number),
    npa: clean(data.npa).replace(/\D/g, "").slice(0, 4),
    locality: clean(data.locality),
    access: clean(data.access),
    orderNumber: clean(data.orderNumber),
    object: clean(data.object),
    notes: clean(data.notes),
  };
}

export function detectKindFromText(text: string): RequestKind {
  const t = text.toLowerCase();
  const scores: Record<RequestKind, number> = {
    tender: 0,
    audit: 0,
    repair: 0,
    other: 0,
  };
  if (
    /appel\s+d[’']offres|cahier des charges|remplacement|modernisation|consultation/.test(
      t,
    )
  ) {
    scores.tender += 3;
  }
  if (/audit|contr[ôo]le|expertise/.test(t)) scores.audit += 3;
  if (/r[ée]paration|panne|d[ée]pannage/.test(t)) scores.repair += 3;
  if (/question|renseignement|demande d['’]information/.test(t)) {
    scores.other += 2;
  }
  const ranked = (Object.entries(scores) as [RequestKind, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  return ranked[0][1] > 0 ? ranked[0][0] : "tender";
}

export function kindFromUnknown(raw: unknown, fallbackText: string): RequestKind {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const value = clean(data.kind);
  if (isRequestKind(value)) return value;
  return detectKindFromText(
    `${fallbackText} ${clean(data.object)} ${clean(data.notes)}`,
  );
}

function splitSwissAddress(value: string) {
  const text = value.replace(/\s+/g, " ").replace(/[.;]+$/, "").trim();
  const match = text.match(
    /^([A-Za-zÀ-ÿ'’. \-]+?)\s+(\d+[A-Za-z]?)\s*,\s*(\d{4})\s+([A-Za-zÀ-ÿ'’ \-]+)$/,
  );
  if (!match) return null;
  return {
    street: match[1].trim(),
    number: match[2].trim(),
    npa: match[3].trim(),
    locality: match[4].trim(),
  };
}

function sliceAfter(text: string, label: RegExp, stop: RegExp) {
  const start = text.match(label);
  if (!start || start.index === undefined) return "";
  const rest = text.slice(start.index + start[0].length);
  const end = rest.search(stop);
  return (end >= 0 ? rest.slice(0, end) : rest).replace(/\s+/g, " ").trim();
}

export function extractFromText(text: string): PurchaseOrderFields {
  const compact = text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
  const fields = { ...EMPTY_PURCHASE_ORDER_FIELDS };

  const order =
    compact.match(/\b(BC-[A-Z0-9-]+)\b/i) ??
    compact.match(/n[°o]\s*de commande\s+([A-Z0-9][A-Z0-9./-]{2,})/i);
  if (order?.[1]) fields.orderNumber = order[1].trim();

  const building = sliceAfter(
    compact,
    /adresse du b[aâ]timent\s+/i,
    /installation|r[ée]f[ée]rence|acc[eè]s au b[aâ]timent|description|message|$/i,
  );
  const office = sliceAfter(
    compact,
    /(?:^|\n)\s*adresse\s+/i,
    /t[ée]l[ée]phone|e-?mail|b[aâ]timent|installation|$/i,
  );
  const parsed =
    splitSwissAddress(building) ||
    splitSwissAddress(office) ||
    splitSwissAddress(
      compact.match(
        /([A-Za-zÀ-ÿ'’. \-]+?\s+\d+[A-Za-z]?\s*,\s*\d{4}\s+[A-Za-zÀ-ÿ'’ \-]+)/,
      )?.[1] ?? "",
    );
  if (parsed) {
    fields.street = parsed.street;
    fields.number = parsed.number;
    fields.npa = parsed.npa;
    fields.locality = parsed.locality;
  }

  const works = sliceAfter(
    compact,
    /description des travaux\s+/i,
    /message|merci|page \d|$/i,
  );
  if (works) fields.object = works.slice(0, 280);

  const concierge = sliceAfter(
    compact,
    /concierge\s+/i,
    /code d['’]acc[eè]s|autre|description|$/i,
  );
  const code = sliceAfter(
    compact,
    /code d['’]acc[eè]s\s+/i,
    /autre|description|message|$/i,
  );
  const otherAccess = sliceAfter(
    compact,
    /autre\s+/i,
    /description des travaux|message|$/i,
  );
  fields.access = [
    concierge && `Concierge : ${concierge}`,
    code && `Code : ${code}`,
    otherAccess,
  ]
    .filter(Boolean)
    .join("\n");

  const installation = sliceAfter(
    compact,
    /installation\s+/i,
    /r[ée]f[ée]rence|acc[eè]s|description|$/i,
  );
  const reference = sliceAfter(
    compact,
    /r[ée]f[ée]rence installation\s+/i,
    /acc[eè]s|description|$/i,
  );
  const message = sliceAfter(
    compact,
    /message\s+/i,
    /ce document est un exemple|merci d['’]avance|page \d|$/i,
  );
  fields.notes = [
    installation && `Installation : ${installation}`,
    reference && `Référence : ${reference}`,
    message && `Message : ${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  return fields;
}

export function interpretPurchaseOrder(text: string) {
  const fields = extractFromText(text);
  const kind = detectKindFromText(`${text}\n${fields.object}\n${fields.notes}`);
  return { fields, kind };
}

export function hasUsefulFields(fields: PurchaseOrderFields) {
  return Boolean(
    fields.street ||
      fields.npa ||
      fields.locality ||
      fields.orderNumber ||
      fields.object,
  );
}

export function mergeFields(
  primary: PurchaseOrderFields,
  fallback: PurchaseOrderFields,
) {
  const merged = { ...EMPTY_PURCHASE_ORDER_FIELDS };
  for (const key of Object.keys(merged) as (keyof PurchaseOrderFields)[]) {
    merged[key] = primary[key] || fallback[key] || "";
  }
  return merged;
}
