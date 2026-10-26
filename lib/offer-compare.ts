import { parseMm } from "./dimensions";
import { formatChf } from "./money";
import {
  compareProposalFields,
  type OfferProposal,
  type OfferProposalName,
} from "./offer-proposal";

export type CompareExisting = {
  ratedLoad?: string | null;
  cabinWidth?: string | null;
  cabinDepth?: string | null;
  doorWidth?: string | null;
};

const EXISTING_KEYS: Partial<Record<string, keyof CompareExisting>> = {
  ratedLoad: "ratedLoad",
  cabinWidth: "cabinWidth",
  cabinDepth: "cabinDepth",
  doorWidth: "doorWidth",
};

const HIGHER_IS_BETTER = new Set<string>([
  "ratedLoad",
  "cabinWidth",
  "cabinDepth",
  "cabinHeight",
  "doorWidth",
  "doorHeight",
  "simpleVisits",
  "completeVisits",
]);

const LOWER_IS_BETTER = new Set<string>([
  "amount",
  "deliveryWeeks",
  "workDays",
  "simplePriceHt",
  "completePriceHt",
]);

const UNITS: Partial<Record<string, string>> = {
  amount: "CHF",
  ratedLoad: "kg",
  cabinWidth: "mm",
  cabinDepth: "mm",
  cabinHeight: "mm",
  doorWidth: "mm",
  doorHeight: "mm",
  deliveryWeeks: "sem.",
  workDays: "j",
  simpleVisits: "visites",
  completeVisits: "visites",
  simplePriceHt: "CHF HT",
  completePriceHt: "CHF HT",
};

export function existingCompareValue(
  existing: CompareExisting | undefined,
  name: string,
) {
  if (!existing) return "—";
  const key = EXISTING_KEYS[name];
  if (!key) return "—";
  const value = existing[key]?.trim();
  return value || "—";
}

function parseNumber(value: string) {
  if (!value.trim() || value.trim() === "—") return null;
  return parseMm(value);
}

function formatDelta(delta: number, name: string) {
  const money =
    name === "amount" ||
    name === "simplePriceHt" ||
    name === "completePriceHt";
  const abs = Math.abs(delta);
  const body = money
    ? `${formatChf(abs)} CHF`
    : (() => {
        const rounded = Math.round(abs);
        const unit = UNITS[name];
        return unit ? `${rounded} ${unit}` : String(rounded);
      })();
  return delta > 0 ? `+${body}` : `−${body}`;
}

export function gainVsExisting(
  name: string,
  proposed: string,
  existing: CompareExisting | undefined,
) {
  const current = existingCompareValue(existing, name);
  const a = parseNumber(proposed);
  const b = parseNumber(current);
  if (a == null || b == null) return null;
  if (HIGHER_IS_BETTER.has(name)) return a - b;
  if (LOWER_IS_BETTER.has(name)) return b - a;
  return null;
}

export function bestAmongOffers(
  name: string,
  values: string[],
) {
  if (values.length < 2) return null;
  const numbers = values.map(parseNumber);
  if (numbers.some((value) => value == null)) return null;
  const ranked = numbers as number[];
  const best = HIGHER_IS_BETTER.has(name)
    ? Math.max(...ranked)
    : LOWER_IS_BETTER.has(name)
      ? Math.min(...ranked)
      : null;
  if (best == null) return null;
  if (ranked.filter((value) => value === best).length !== 1) return null;
  return ranked.indexOf(best);
}

export function positivePointsForOffer(input: {
  fields: ReturnType<typeof compareProposalFields>;
  existing?: CompareExisting;
  cellValue: (name: string) => string;
  allValues: (name: string) => string[];
}) {
  const points: string[] = [];
  for (const field of input.fields) {
    const proposed = input.cellValue(field.name);
    const gain = gainVsExisting(field.name, proposed, input.existing);
    if (gain != null && gain > 0) {
      points.push(`${field.label} : ${formatDelta(gain, field.name)} vs existant`);
    }
    const values = input.allValues(field.name);
    const winner = bestAmongOffers(field.name, values);
    if (
      winner != null &&
      values[winner] === proposed &&
      (HIGHER_IS_BETTER.has(field.name) || LOWER_IS_BETTER.has(field.name))
    ) {
      const already = points.some((point) => point.startsWith(`${field.label} :`));
      if (!already) {
        points.push(`${field.label} : le plus avantageux`);
      }
    }
  }
  return points;
}
