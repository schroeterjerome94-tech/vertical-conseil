import { InstallationSurchargeTable } from "./InstallationSurchargeTable";
import { formatChf } from "@/lib/money";
import {
  ASCE_CDC_BASE_HT,
  INSTALLATION_SURCHARGE_PCT,
} from "@/lib/installation-surcharge";

export function AsceProTariffTable({ compact = false }: { compact?: boolean }) {
  return (
    <InstallationSurchargeTable
      compact={compact}
      baseHt={ASCE_CDC_BASE_HT}
      title="Tarif version Pro, par cahier des charges"
      intro={
        <p>
          Ce n’est pas un abonnement. Un seul tarif par cahier des charges :{" "}
          {formatChf(ASCE_CDC_BASE_HT)} CHF HT pour une installation, puis{" "}
          {INSTALLATION_SURCHARGE_PCT} % de plus à chaque installation
          supplémentaire à la même adresse. Hors TVA 8,1 %.
        </p>
      }
    />
  );
}
