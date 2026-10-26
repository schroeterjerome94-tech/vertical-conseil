import type { ReactNode } from "react";

export function TariffMoneyTable({
  title,
  intro,
  firstHeader,
  rows,
  compact = false,
}: {
  title: string;
  intro: ReactNode;
  firstHeader: string;
  rows: { key: string; label: string; ht: string; vat: string; ttc: string }[];
  compact?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-line bg-white ${
        compact ? "mt-3" : "mt-6"
      }`}
    >
      <div className="border-b border-line px-4 py-3 sm:px-6">
        <h3
          className={`font-semibold text-navy ${compact ? "text-[15px]" : "text-lg"}`}
        >
          {title}
        </h3>
        <div className="mt-1 grid gap-2 text-[13px] leading-6 text-muted">
          {intro}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line bg-soft text-navy">
              <th className="px-4 py-2.5 font-semibold sm:px-6">{firstHeader}</th>
              <th className="px-4 py-2.5 text-right font-semibold sm:px-6">
                HT
              </th>
              <th className="px-4 py-2.5 text-right font-semibold sm:px-6">
                TVA 8,1 %
              </th>
              <th className="px-4 py-2.5 text-right font-semibold sm:px-6">
                TTC
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-2.5 text-navy sm:px-6">{row.label}</td>
                <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap text-navy sm:px-6">
                  {row.ht} CHF
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap text-muted sm:px-6">
                  {row.vat} CHF
                </td>
                <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap text-navy sm:px-6">
                  {row.ttc} CHF
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
