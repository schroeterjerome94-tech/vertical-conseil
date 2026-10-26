import { TariffMoneyTable } from "./TariffMoneyTable";
import { formatChf } from "@/lib/money";
import {
  GERANCE_PRO_BASE_HT,
  GERANCE_PRO_BRACKET_PCT,
  GERANCE_PRO_BRACKET_SIZE,
  GERANCE_PRO_MAX,
  geranceProTariffRows,
} from "@/lib/gerance-pro-pricing";

export function GeranceProTariffTable({ compact = false }: { compact?: boolean }) {
  return (
    <TariffMoneyTable
      compact={compact}
      title="Abonnement Pro, par année"
      firstHeader="Parc d’installations"
      rows={geranceProTariffRows()}
      intro={
        <>
          <p>
            {formatChf(GERANCE_PRO_BASE_HT)} CHF HT par année de 5 à{" "}
            {GERANCE_PRO_BRACKET_SIZE} installations, puis {GERANCE_PRO_BRACKET_PCT}{" "}
            % de plus à chaque palier de {GERANCE_PRO_BRACKET_SIZE} installations,
            jusqu’à {GERANCE_PRO_MAX}. Hors TVA 8,1 %.
          </p>
          <p>
            L’abonnement comprend l’historique de toutes les installations, les
            questions concernant les offres de réparation ou les contrats de
            maintenance, les rapports et les demandes budgétaires de réparation.
            Si un déplacement est nécessaire, il est facturé selon la complexité
            du dossier.
          </p>
        </>
      }
    />
  );
}
