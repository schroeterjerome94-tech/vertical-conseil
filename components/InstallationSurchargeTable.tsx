import type { ReactNode } from "react";
import { TariffMoneyTable } from "./TariffMoneyTable";
import { formatChf } from "@/lib/money";
import {
  INSTALLATION_SURCHARGE_PCT,
  surchargeTariffRows,
} from "@/lib/installation-surcharge";

export function InstallationSurchargeTable({
  title,
  intro,
  baseHt,
  compact = false,
}: {
  title: string;
  intro?: ReactNode;
  baseHt: number;
  compact?: boolean;
}) {
  return (
    <TariffMoneyTable
      compact={compact}
      title={title}
      firstHeader="Installations à la même adresse"
      intro={
        intro ?? (
          <p>
            {formatChf(baseHt)} CHF HT pour une installation, puis{" "}
            {INSTALLATION_SURCHARGE_PCT} % de plus à chaque installation
            supplémentaire à la même adresse. Hors TVA 8,1 %.
          </p>
        )
      }
      rows={surchargeTariffRows(baseHt, 5).map((row) => ({
        key: String(row.installations),
        label:
          row.installations === 1
            ? "1 installation"
            : `${row.installations} installations`,
        ht: row.ht,
        vat: row.vat,
        ttc: row.ttc,
      }))}
    />
  );
}
