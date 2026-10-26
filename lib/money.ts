export const VAT_RATE = 0.081;

export function keepMoney(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/^\d*(?:\.\d{0,2})?/);
  return match?.[0] ?? "";
}

export function parseMoney(value: string | null | undefined) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace("’", "")
    .replace("'", "")
    .replace(",", ".");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

function groupChf(value: number) {
  const [whole, cents] = (Math.round(value * 100) / 100).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped}.${cents}`;
}

export function formatChf(value: number) {
  return groupChf(roundTo005(value));
}

export function formatChf2(value: number) {
  return groupChf(value);
}

export function roundTo005(value: number) {
  return Math.round(value * 20) / 20;
}

export type PriceDiscounts = {
  rabais?: string | null;
  escompte?: string | null;
  prorata?: string | null;
  arrondi?: string | null;
};

function discountStep(base: number, pctRaw: string | null | undefined) {
  const pct = Math.min(100, Math.max(0, parseMoney(pctRaw) ?? 0));
  const minus = roundTo005(base * (pct / 100));
  const total = roundTo005(base - minus);
  return { pct, minus, total };
}

export function vatFromHt(
  ht: string | null | undefined,
  discounts?: PriceDiscounts,
) {
  const brut = parseMoney(ht) ?? 0;
  const rabais = discountStep(brut, discounts?.rabais);
  const escompte = discountStep(rabais.total, discounts?.escompte);
  const prorata = discountStep(escompte.total, discounts?.prorata);
  const arrondiHt = Math.min(prorata.total, Math.max(0, parseMoney(discounts?.arrondi) ?? 0));
  const arrondiVat = Math.round(arrondiHt * VAT_RATE * 100) / 100;
  const arrondiTtc = roundTo005(arrondiHt + arrondiVat);
  const net = roundTo005(prorata.total - arrondiHt);
  const vat = Math.round(net * VAT_RATE * 100) / 100;
  const ttc = roundTo005(net + vat);
  return {
    ht: brut,
    net,
    vat,
    ttc,
    rabais,
    escompte,
    prorata,
    arrondi: { ht: arrondiHt, vat: arrondiVat, ttc: arrondiTtc, total: net },
  };
}

export function formatMoney(raw: string | number | null | undefined) {
  const amount = typeof raw === "number" ? raw : parseMoney(raw);
  if (amount == null) return "0.00";
  return formatChf(amount);
}

export function formatHtTtc(
  ht: string | null | undefined,
  discounts?: PriceDiscounts,
) {
  const parts = vatFromHt(ht, discounts);
  return `${formatChf(parts.net)} CHF HT · TVA ${formatChf(parts.vat)} CHF · ${formatChf(parts.ttc)} CHF TTC`;
}
