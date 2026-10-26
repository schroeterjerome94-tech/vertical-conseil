import {
  ASCE_CDC_BASE_HT,
  INSTALLATION_SURCHARGE_PCT,
  surchargeHt,
  surchargeTariffRows,
} from "@/lib/installation-surcharge";

export {
  ASCE_CDC_BASE_HT,
  INSTALLATION_SURCHARGE_PCT as ASCE_CDC_SURCHARGE_PCT,
};

export function asceCdcHt(installationCount: number) {
  return surchargeHt(ASCE_CDC_BASE_HT, installationCount);
}

export function asceProTariffRows(max = 5) {
  return surchargeTariffRows(ASCE_CDC_BASE_HT, max);
}
