export const TYPICAL_NORMS = [
  { id: "en-81-20", label: "EN 81-20 — Construction des ascenseurs" },
  { id: "en-81-50", label: "EN 81-50 — Calculs, essais et examens" },
  { id: "en-81-21", label: "EN 81-21 — Bâtiments existants" },
  { id: "en-81-28", label: "EN 81-28 — Alarme en cabine" },
  { id: "en-81-41", label: "EN 81-41 — Appareils pour personnes à mobilité réduite" },
  { id: "en-81-70", label: "EN 81-70 — Accessibilité" },
  { id: "en-81-72", label: "EN 81-72 — Ascenseurs pompiers" },
  { id: "en-81-73", label: "EN 81-73 — Comportement des ascenseurs en cas d’incendie" },
  { id: "ch-esti", label: "Prescriptions suisses (ESTI / OIBT)" },
] as const;

export type ExtraFields = {
  coverPhotoId?: string;
  norms?: string[];
  audit?: {
    notes?: string;
    date?: string;
  };
  repair?: {
    notes?: string;
    date?: string;
  };
  maintenance?: {
    notes?: string;
    date?: string;
  };
  specification?: {
    purpose?: "remplacement" | "modernisation";
    title?: string;
    content?: string;
    characteristics?: Partial<Record<string, string>>;
    selectedClauses?: string[];
    mediaIds?: string[];
    importantNotes?: string;
  };
};

function noteBlock(value: ExtraFields["audit"]) {
  if (!value || typeof value !== "object") return undefined;
  return {
    notes: String(value.notes ?? ""),
    date: value.date ? String(value.date) : "",
  };
}

export function parseExtraFields(raw: string | null | undefined): ExtraFields {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ExtraFields;
    if (!parsed || typeof parsed !== "object") return {};
    const norms = Array.isArray(parsed.norms)
      ? parsed.norms.filter((id) =>
          TYPICAL_NORMS.some((item) => item.id === id),
        )
      : [];
    const audit =
      parsed.audit && typeof parsed.audit === "object"
        ? {
            notes: String(parsed.audit.notes ?? ""),
            date: parsed.audit.date ? String(parsed.audit.date) : "",
          }
        : undefined;
    const spec = parsed.specification;
    const specification =
      spec && typeof spec === "object"
        ? {
            purpose:
              spec.purpose === "modernisation" ? "modernisation" as const : "remplacement" as const,
            title: String(spec.title ?? ""),
            content: String(spec.content ?? ""),
            characteristics:
              spec.characteristics && typeof spec.characteristics === "object"
                ? Object.fromEntries(
                    Object.entries(spec.characteristics).map(([key, value]) => [
                      key,
                      value == null ? "" : String(value),
                    ]),
                  )
                : undefined,
            selectedClauses: Array.isArray(spec.selectedClauses)
              ? spec.selectedClauses.map(String)
              : undefined,
            mediaIds: Array.isArray(spec.mediaIds)
              ? [...new Set(spec.mediaIds.map(String).filter(Boolean))]
              : undefined,
            importantNotes: String(spec.importantNotes ?? "").trim() || undefined,
          }
        : undefined;
    const coverPhotoId =
      typeof parsed.coverPhotoId === "string" && parsed.coverPhotoId.trim()
        ? parsed.coverPhotoId.trim()
        : undefined;
    return {
      coverPhotoId,
      norms,
      audit,
      repair: noteBlock(parsed.repair),
      maintenance: noteBlock(parsed.maintenance),
      specification,
    };
  } catch {
    return {};
  }
}

export function serializeExtraFields(input: ExtraFields) {
  return JSON.stringify({
    coverPhotoId: input.coverPhotoId,
    norms: input.norms ?? [],
    audit: input.audit,
    repair: input.repair,
    maintenance: input.maintenance,
    specification: input.specification,
  });
}

export function selectedNormLabels(raw: string | null | undefined) {
  const { norms } = parseExtraFields(raw);
  return TYPICAL_NORMS.filter((item) => norms?.includes(item.id)).map(
    (item) => item.label,
  );
}
