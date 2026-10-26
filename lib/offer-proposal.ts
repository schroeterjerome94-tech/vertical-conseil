import { formatAreaM2, formatLxP } from "./dimensions";
import { formatHtTtc, keepMoney, type PriceDiscounts } from "./money";

export const OFFER_PROPOSAL_FIELDS = [
  { name: "ratedLoad", label: "Charge utile proposée" },
  { name: "cabinWidth", label: "Largeur de cabine", mm: true, group: "cabine" },
  { name: "cabinDepth", label: "Profondeur de cabine", mm: true, group: "cabine" },
  { name: "cabinHeight", label: "Hauteur de cabine", mm: true, group: "cabine" },
  { name: "doorWidth", label: "Largeur de porte", mm: true, group: "porte" },
  { name: "doorHeight", label: "Hauteur de porte", mm: true, group: "porte" },
  { name: "doorBrand", label: "Marque de porte" },
  { name: "doorKind", label: "Type de porte" },
  { name: "power", label: "Puissance (kW)" },
  { name: "currentNom", label: "Courant nominal (A)" },
  { name: "currentStart", label: "Courant de démarrage (A)" },
  { name: "voltage", label: "Tension" },
  { name: "machineType", label: "Type de machine" },
  { name: "machineLocation", label: "Emplacement de la machine" },
  { name: "deliveryWeeks", label: "Délai de livraison (semaines)" },
  { name: "workDays", label: "Durée des travaux (jours ouvrables)" },
  { name: "scaffolds", label: "Échafaudages de montage" },
  { name: "machineHousing", label: "Logement machines à modifier" },
  { name: "simpleVisits", label: "Contrat simple : nombre de visites" },
  { name: "simplePriceHt", label: "Contrat simple : prix hors taxe" },
  { name: "completeVisits", label: "Contrat complet : nombre de visites" },
  { name: "completePriceHt", label: "Contrat complet : prix hors taxe" },
  { name: "rabaisPct", label: "Rabais (%)" },
  { name: "escomptePct", label: "Escompte (%)" },
  { name: "prorataPct", label: "Prorata (%)" },
  { name: "arrondiHt", label: "Arrondi" },
  { name: "contactLastName", label: "Nom" },
  { name: "contactFirstName", label: "Prénom" },
  { name: "contactPhone", label: "Téléphone" },
  { name: "contactEmail", label: "E-mail" },
  { name: "acknowledged", label: "Indications reconnues" },
] as const;

export type OfferProposalName = (typeof OFFER_PROPOSAL_FIELDS)[number]["name"];
export type OfferProposal = Partial<Record<OfferProposalName, string>>;

const NUMERIC_PROPOSAL_FIELDS = new Set<OfferProposalName>([
  "ratedLoad",
  "cabinWidth",
  "cabinDepth",
  "cabinHeight",
  "doorWidth",
  "doorHeight",
  "deliveryWeeks",
  "workDays",
  "simpleVisits",
  "completeVisits",
]);

const DECIMAL_PROPOSAL_FIELDS = new Set<OfferProposalName>([
  "power",
  "currentNom",
  "currentStart",
  "voltage",
]);

const MONEY_PROPOSAL_FIELDS = new Set<OfferProposalName>([
  "simplePriceHt",
  "completePriceHt",
  "rabaisPct",
  "escomptePct",
  "prorataPct",
  "arrondiHt",
]);

export function keepDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function keepDecimal(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "");
  const sep = cleaned.search(/[.,]/);
  if (sep < 0) return cleaned;
  return (
    cleaned.slice(0, sep + 1) + cleaned.slice(sep + 1).replace(/[.,]/g, "")
  );
}

export function requiredProposalFields(selectedClauses?: string[]) {
  const selected = new Set(selectedClauses ?? []);
  return OFFER_PROPOSAL_FIELDS.map((field) => field.name).filter((name) => {
    if (
      name === "acknowledged" ||
      name === "rabaisPct" ||
      name === "escomptePct" ||
      name === "prorataPct" ||
      name === "arrondiHt" ||
      name === "voltage"
    ) {
      return false;
    }
    if (name === "simpleVisits" || name === "simplePriceHt") {
      return selected.has("mai-1");
    }
    if (name === "completeVisits" || name === "completePriceHt") {
      return selected.has("mai-2");
    }
    return true;
  });
}

export function isOfferComplete(
  amount: string | null | undefined,
  proposal?: OfferProposal,
  selectedClauses?: string[],
) {
  if (!String(amount ?? "").trim()) return false;
  if (!proposal) return false;
  if (!String(proposal.contactEmail ?? "").includes("@")) return false;
  return requiredProposalFields(selectedClauses).every((name) =>
    String(proposal[name] ?? "").trim(),
  );
}

export function emptyProposal(): Record<OfferProposalName, string> {
  return Object.fromEntries(
    OFFER_PROPOSAL_FIELDS.map((field) => [field.name, ""]),
  ) as Record<OfferProposalName, string>;
}

export function parseProposal(raw: string | null | undefined): OfferProposal {
  const values = emptyProposal();
  if (!raw) return values;
  try {
    const parsed = JSON.parse(raw) as OfferProposal;
    if (!parsed || typeof parsed !== "object") return values;
    for (const field of OFFER_PROPOSAL_FIELDS) {
      const value = parsed[field.name];
      values[field.name] = value == null ? "" : String(value);
    }
  } catch {
    return values;
  }
  return values;
}

export function parseProposalForm(formData: FormData) {
  const values = emptyProposal();
  for (const field of OFFER_PROPOSAL_FIELDS) {
    const raw = String(formData.get(field.name) ?? "").trim();
    values[field.name] = MONEY_PROPOSAL_FIELDS.has(field.name)
      ? keepMoney(raw)
      : DECIMAL_PROPOSAL_FIELDS.has(field.name)
        ? keepDecimal(raw)
        : NUMERIC_PROPOSAL_FIELDS.has(field.name)
          ? keepDigits(raw)
          : raw;
  }
  return JSON.stringify(values);
}

export function compareProposalFields(selectedClauses?: string[]) {
  return [
    { name: "amount" as const, label: "Montant HT (CHF)" },
    { name: "rabaisPct" as const, label: "Rabais (%)" },
    { name: "escomptePct" as const, label: "Escompte (%)" },
    { name: "prorataPct" as const, label: "Prorata (%)" },
    { name: "arrondiHt" as const, label: "Arrondi" },
    { name: "contactLastName" as const, label: "Nom" },
    { name: "contactFirstName" as const, label: "Prénom" },
    { name: "contactPhone" as const, label: "Téléphone" },
    { name: "contactEmail" as const, label: "E-mail" },
    ...requiredProposalFields(selectedClauses)
      .filter((name) => !name.startsWith("contact"))
      .map((name) => {
      const field = OFFER_PROPOSAL_FIELDS.find((item) => item.name === name);
      return { name, label: field?.label ?? name };
    }),
  ];
}

export function discountsFromProposal(
  proposal?: OfferProposal | null,
): PriceDiscounts {
  return {
    rabais: proposal?.rabaisPct,
    escompte: proposal?.escomptePct,
    prorata: proposal?.prorataPct,
    arrondi: proposal?.arrondiHt,
  };
}

export function formatProposalSummary(raw: string | null | undefined) {
  const values = parseProposal(raw);
  const parts: string[] = [];
  const contact = [values.contactLastName, values.contactFirstName]
    .filter((part) => part?.trim())
    .join(" ");
  if (contact) parts.push(contact);
  if (values.contactPhone?.trim()) parts.push(values.contactPhone.trim());
  if (values.contactEmail?.trim()) parts.push(values.contactEmail.trim());
  if (values.ratedLoad?.trim()) {
    parts.push(`Charge ${values.ratedLoad.trim()}`);
  }
  const cabin = formatLxP(values.cabinWidth, values.cabinDepth);
  const area = formatAreaM2(values.cabinWidth, values.cabinDepth);
  const height = values.cabinHeight?.trim();
  if (cabin || height) {
    parts.push(
      `Cabine ${[cabin, height ? `H ${height} mm` : "", area].filter(Boolean).join(" · ")}`,
    );
  }
  if (values.doorWidth?.trim() || values.doorHeight?.trim()) {
    parts.push(
      `Portes ${values.doorWidth || "…"} x ${values.doorHeight || "…"} mm (LxH)`,
    );
  }
  if (values.doorBrand?.trim() || values.doorKind?.trim()) {
    parts.push(
      ["Marque", values.doorBrand?.trim(), values.doorKind?.trim()]
        .filter(Boolean)
        .join(" · "),
    );
  }
  const discounts = [
    values.rabaisPct?.trim() ? `rabais ${values.rabaisPct.trim()} %` : "",
    values.escomptePct?.trim() ? `escompte ${values.escomptePct.trim()} %` : "",
    values.prorataPct?.trim() ? `prorata ${values.prorataPct.trim()} %` : "",
    values.arrondiHt?.trim() ? `arrondi ${formatHtTtc(values.arrondiHt)}` : "",
  ].filter(Boolean);
  if (discounts.length) parts.push(discounts.join(" · "));
  if (values.simpleVisits?.trim() || values.simplePriceHt?.trim()) {
    parts.push(
      `Contrat simple ${[values.simpleVisits?.trim() ? `${values.simpleVisits.trim()} visites` : "", formatHtTtc(values.simplePriceHt)].filter(Boolean).join(" · ")}`,
    );
  }
  if (values.completeVisits?.trim() || values.completePriceHt?.trim()) {
    parts.push(
      `Contrat complet ${[values.completeVisits?.trim() ? `${values.completeVisits.trim()} visites` : "", formatHtTtc(values.completePriceHt)].filter(Boolean).join(" · ")}`,
    );
  }
  return parts.join(" · ");
}
