import { parseExtraFields, type ExtraFields } from "./norms";

type InstallationLike = {
  safetyInfo?: string | null;
  modernizations?: string | null;
  extraFields?: string | null;
};

export const SPEC_PURPOSES = [
  { value: "remplacement", label: "Remplacement" },
  { value: "modernisation", label: "Modernisation" },
] as const;

export type SpecPurpose = (typeof SPEC_PURPOSES)[number]["value"];

export function isSpecPurpose(value: string): value is SpecPurpose {
  return value === "remplacement" || value === "modernisation";
}

export function specPurposeLabel(purpose: string | undefined) {
  return (
    SPEC_PURPOSES.find((item) => item.value === purpose)?.label ?? "Cahier des charges"
  );
}

export function specificationWorkType(extraFields?: string | null) {
  const purpose = parseExtraFields(extraFields).specification?.purpose;
  if (purpose !== "remplacement" && purpose !== "modernisation") return "—";
  return specPurposeLabel(purpose);
}

export function dossierFromInstallation(item: InstallationLike) {
  return parseExtraFields(item.extraFields);
}

export function hasAudit(item: InstallationLike, extra?: ExtraFields) {
  const fields = extra ?? parseExtraFields(item.extraFields);
  return Boolean(
    item.safetyInfo?.trim() ||
      item.modernizations?.trim() ||
      fields.audit?.notes?.trim() ||
      fields.audit?.date?.trim() ||
      fields.norms?.length,
  );
}

export function hasSpecification(extra: ExtraFields) {
  const spec = extra.specification;
  if (!spec) return false;
  if (spec.title?.trim() || spec.content?.trim()) return true;
  return Object.values(spec.characteristics ?? {}).some((value) =>
    String(value ?? "").trim(),
  );
}
