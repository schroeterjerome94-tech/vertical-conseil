import { formatChf, vatFromHt } from "@/lib/money";

export const INSTALLATION_SURCHARGE_PCT = 15;
export const ASCE_CDC_BASE_HT = 180;
export const GERANCE_AO_BASE_HT = 2580;

export function surchargeHt(baseHt: number, installationCount: number) {
  const n = Math.max(1, Math.floor(installationCount));
  return baseHt * (1 + (INSTALLATION_SURCHARGE_PCT / 100) * (n - 1));
}

export function surchargeTariffRows(baseHt: number, max = 5) {
  return Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    const money = vatFromHt(String(surchargeHt(baseHt, n)));
    return {
      installations: n,
      ht: formatChf(money.net),
      vat: formatChf(money.vat),
      ttc: formatChf(money.ttc),
    };
  });
}
