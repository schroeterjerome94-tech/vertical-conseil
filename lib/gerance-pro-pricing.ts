import { formatChf, vatFromHt } from "@/lib/money";

export const GERANCE_PRO_BASE_HT = 2560;
export const GERANCE_PRO_BRACKET_PCT = 20;
export const GERANCE_PRO_BRACKET_SIZE = 50;
export const GERANCE_PRO_MAX = 300;

export function geranceProTariffRows() {
  const rows = [];
  let step = 0;
  for (
    let to = GERANCE_PRO_BRACKET_SIZE;
    to <= GERANCE_PRO_MAX;
    to += GERANCE_PRO_BRACKET_SIZE
  ) {
    const from = to === GERANCE_PRO_BRACKET_SIZE ? 5 : to - GERANCE_PRO_BRACKET_SIZE + 1;
    const ht = GERANCE_PRO_BASE_HT * (1 + GERANCE_PRO_BRACKET_PCT / 100) ** step;
    const money = vatFromHt(String(ht));
    rows.push({
      key: `${from}-${to}`,
      label: `${from} à ${to} installations`,
      ht: formatChf(money.net),
      vat: formatChf(money.vat),
      ttc: formatChf(money.ttc),
    });
    step += 1;
  }
  return rows;
}
