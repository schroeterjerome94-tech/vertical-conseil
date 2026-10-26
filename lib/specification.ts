import { formatAreaM2, formatLxP } from "./dimensions";
import { specPurposeLabel, type SpecPurpose } from "./dossier";
import {
  formatSelectedClauses,
  parseSelectedClauses,
} from "./specification-clauses";

export const SPEC_FIELDS = [
  { name: "elevatorType", label: "Type d’installation" },
  { name: "controlType", label: "Manœuvre" },
  { name: "tractionType", label: "Entraînement" },
  { name: "ratedLoad", label: "Charge utile" },
  { name: "ratedSpeed", label: "Vitesse" },
  { name: "stopCount", label: "Arrêts" },
  { name: "landingAccess", label: "Accès" },
  { name: "serviceFaces", label: "Nb de faces de service" },
  { name: "floorDesignation", label: "Désignation des étages" },
  { name: "travel", label: "Course" },
  { name: "machineRoomLocation", label: "Emplacement du local machines" },
  { name: "doorType", label: "Type de portes palières et cabine" },
  { name: "shaft", label: "Cage" },
  { name: "headroom", label: "Dépassement supérieur" },
  { name: "pitDepth", label: "Profondeur de fosse" },
] as const;

export const CABIN_FIELDS = [
  { name: "cabinWidth", label: "Largeur" },
  { name: "cabinDepth", label: "Profondeur" },
  { name: "cabinHeight", label: "Hauteur" },
  { name: "cabinDoorWidth", label: "Largeur de porte" },
  { name: "cabinDoorHeight", label: "Hauteur de porte" },
] as const;

export const DIMENSION_DISCLAIMER = [
  "*Les dimensions sont à vérifier par l’entrepreneur. Les dimensions et la structure de la gaine sont existantes. L’approbation du plan de disposition n’engage pas le MO ou son représentant sur ces points.",
  "L’installation proposée doit être intégrée dans la cage existante. Si des modifications des cotes mentionnées ci-dessus doivent avoir lieu, le soumissionnaire doit clairement le faire apparaître dans la lettre d’accompagnement de son dossier. Le cas échéant, ces travaux seront considérés comme inclus dans son devis.",
  "Les composants doivent être adaptés à l’environnement dans lequel doit fonctionner l’installation.",
].join("\n\n");

const ALL_SPEC_KEYS = [
  ...SPEC_FIELDS,
  ...CABIN_FIELDS,
  { name: "notes", label: "Notes" },
] as const;

export type SpecFieldName = (typeof ALL_SPEC_KEYS)[number]["name"];

export type SpecificationRecord = {
  purpose?: SpecPurpose;
  title?: string;
  content?: string;
  characteristics?: Partial<Record<string, string>>;
  selectedClauses?: string[];
  mediaIds?: string[];
  importantNotes?: string;
};

export function emptyCharacteristics(): Record<SpecFieldName, string> {
  return Object.fromEntries(
    ALL_SPEC_KEYS.map((field) => [field.name, ""]),
  ) as Record<SpecFieldName, string>;
}

export function parseCharacteristics(
  raw: SpecificationRecord["characteristics"] | undefined,
): Record<SpecFieldName, string> {
  const values = emptyCharacteristics();
  if (!raw || typeof raw !== "object") return values;
  for (const field of ALL_SPEC_KEYS) {
    const value = raw[field.name];
    values[field.name] = value == null ? "" : String(value);
  }
  return values;
}

export function parseSpecificationForm(formData: FormData): SpecificationRecord {
  const purpose =
    formData.get("purpose") === "modernisation" ? "modernisation" : "remplacement";
  const characteristics = emptyCharacteristics();
  for (const field of ALL_SPEC_KEYS) {
    characteristics[field.name] = String(formData.get(field.name) ?? "").trim();
  }
  return {
    purpose,
    title: String(formData.get("title") ?? "").trim(),
    characteristics,
    selectedClauses: parseSelectedClauses(
      formData.getAll("clauseIds").map(String),
    ),
    mediaIds: [...new Set(formData.getAll("mediaIds").map(String).filter(Boolean))],
    importantNotes: String(formData.get("importantNotes") ?? "").trim(),
  };
}

export function documentsForSpecification<T extends { id: string }>(
  documents: T[],
  spec?: Pick<SpecificationRecord, "mediaIds"> | null,
) {
  if (!spec?.mediaIds) return documents;
  const allowed = new Set(spec.mediaIds);
  return documents.filter((item) => allowed.has(item.id));
}

export function characteristicsFromExisting(item: Record<string, unknown>) {
  const values = emptyCharacteristics();
  const copy: Partial<Record<SpecFieldName, string>> = {
    elevatorType: "elevatorType",
    controlType: "controlType",
    tractionType: "tractionType",
    ratedLoad: "ratedLoad",
    ratedSpeed: "ratedSpeed",
    stopCount: "stopCount",
    landingAccess: "landingAccess",
    travel: "travel",
    machineRoomLocation: "machineRoomLocation",
    headroom: "headroom",
    pitDepth: "pitDepth",
    cabinWidth: "cabinWidth",
    cabinDepth: "cabinDepth",
  };
  for (const [name, source] of Object.entries(copy)) {
    const value = item[source];
    if (typeof value === "string" && value.trim()) {
      values[name as SpecFieldName] = value.trim();
    }
  }
  const doorCabin = typeof item.doorType === "string" ? item.doorType.trim() : "";
  const doorLanding =
    typeof item.landingDoorType === "string" ? item.landingDoorType.trim() : "";
  values.doorType = [doorCabin, doorLanding].filter(Boolean).join(" / ");
  const shaft = formatLxP(
    typeof item.shaftWidth === "string" ? item.shaftWidth : null,
    typeof item.shaftDepth === "string" ? item.shaftDepth : null,
  );
  if (shaft) values.shaft = shaft;
  values.notes = DIMENSION_DISCLAIMER;
  return values;
}

export function specificationHasContent(spec: SpecificationRecord | undefined) {
  if (!spec) return false;
  if (spec.title?.trim() || spec.content?.trim() || spec.selectedClauses?.length) {
    return true;
  }
  return ALL_SPEC_KEYS.some((field) => spec.characteristics?.[field.name]?.trim());
}

export function formatSpecificationText(spec: SpecificationRecord | undefined) {
  if (!spec) return "";
  const lines: string[] = [];
  if (spec.purpose) lines.push(`Objet : ${specPurposeLabel(spec.purpose)}`);
  if (lines.length) lines.push("");
  lines.push("Caractéristiques de la nouvelle installation");
  lines.push("");

  const values = parseCharacteristics(spec.characteristics);
  for (const field of SPEC_FIELDS) {
    const value = values[field.name]?.trim();
    if (value) lines.push(`${field.label} : ${value}`);
  }

  const cabin = formatLxP(values.cabinWidth, values.cabinDepth);
  const cabinArea = formatAreaM2(values.cabinWidth, values.cabinDepth);
  const cabinParts = [
    cabin,
    values.cabinHeight?.trim() ? `H ${values.cabinHeight.trim()} mm` : "",
    cabinArea,
  ].filter(Boolean);
  if (cabinParts.length) {
    lines.push("");
    lines.push(`Dimensions de la cabine : ${cabinParts.join(" · ")}`);
  }
  if (values.cabinDoorWidth?.trim() || values.cabinDoorHeight?.trim()) {
    lines.push(
      `Portes de cabine : ${values.cabinDoorWidth || "…"} x ${values.cabinDoorHeight || "…"} mm (LxH)`,
    );
  }

  if (values.notes?.trim()) {
    lines.push("");
    lines.push(values.notes.trim());
  }

  const selected = formatSelectedClauses(spec.selectedClauses ?? []);
  if (selected) {
    lines.push("");
    lines.push(selected);
  }

  const leftover = spec.content?.trim();
  if (leftover && leftover !== values.notes?.trim()) {
    lines.push("");
    lines.push(leftover);
  }
  return lines.join("\n").trim();
}
