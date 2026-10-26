import type { ReactNode } from "react";
import { PrintCompareButton } from "./PrintCompareButton";
import {
  existingCompareValue,
  gainVsExisting,
  positivePointsForOffer,
  type CompareExisting,
} from "@/lib/offer-compare";
import {
  compareProposalFields,
  discountsFromProposal,
  parseProposal,
} from "@/lib/offer-proposal";
import { formatChf, formatHtTtc, parseMoney } from "@/lib/money";

export type CompareOffer = {
  id: string;
  name: string;
  organizationName?: string | null;
  amount: string;
  proposal: string | null;
};

export function OfferCompareReport({
  offers,
  selectedClauses,
  awardedOfferId,
  awardAction,
  existing,
}: {
  offers: CompareOffer[];
  selectedClauses?: string[];
  awardedOfferId?: string | null;
  awardAction?: (offerId: string) => ReactNode;
  existing?: CompareExisting;
}) {
  const fields = compareProposalFields(selectedClauses);
  const parsed = offers.map((offer) => ({
    ...offer,
    values: parseProposal(offer.proposal),
  }));

  function cellValue(
    offer: (typeof parsed)[number],
    name: (typeof fields)[number]["name"],
  ) {
    if (name === "amount") return offer.amount.trim() || "—";
    return offer.values[name]?.trim() || "—";
  }

  function differs(name: (typeof fields)[number]["name"]) {
    const values = [
      existingCompareValue(existing, name),
      ...parsed.map((offer) => cellValue(offer, name)),
    ];
    return new Set(values).size > 1;
  }

  const positives = parsed.map((offer) =>
    positivePointsForOffer({
      fields,
      existing,
      cellValue: (name) =>
        cellValue(offer, name as (typeof fields)[number]["name"]),
      allValues: (name) =>
        parsed.map((item) =>
          cellValue(item, name as (typeof fields)[number]["name"]),
        ),
    }),
  );

  return (
    <section className="offer-compare mt-6 rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-6 py-4 print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-navy">
            Rapport comparatif
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Dimensions de l’existant, propositions et points positifs.
          </p>
        </div>
        {offers.length ? <PrintCompareButton /> : null}
      </div>

      <div className="hidden px-6 pt-4 print:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
          Vertical Conseil · Rapport comparatif des offres
        </p>
      </div>

      {offers.length ? (
        <>
          <div className="grid gap-4 border-b border-line px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {parsed.map((offer, index) => (
              <div
                key={offer.id}
                className="rounded-2xl border border-line bg-green-soft p-4"
              >
                <p className="text-[13px] font-semibold text-navy">
                  {offer.name}
                  {offer.organizationName ? ` · ${offer.organizationName}` : ""}
                </p>
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-green">
                  Résumé · points positifs
                </p>
                {positives[index]?.length ? (
                  <ul className="mt-2 grid gap-1 text-[13px] text-navy">
                    {positives[index].map((point) => (
                      <li key={point}>– {point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-muted">
                    Aucun gain mesurable par rapport à l’existant.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-b border-line bg-soft text-[12px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="sticky left-0 bg-soft px-4 py-3 font-semibold">
                    Point
                  </th>
                  <th className="px-4 py-3 font-semibold text-navy">
                    Existant
                  </th>
                  {parsed.map((offer) => (
                    <th
                      key={offer.id}
                      className="px-4 py-3 font-semibold normal-case tracking-normal text-navy"
                    >
                      {offer.name}
                      {offer.organizationName ? (
                        <span className="mt-0.5 block text-[12px] font-normal text-muted">
                          {offer.organizationName}
                        </span>
                      ) : null}
                      {awardedOfferId === offer.id ? (
                        <span className="mt-1 block text-[12px] font-semibold text-logo">
                          Offre retenue
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => {
                  const changed = differs(field.name);
                  const current = existingCompareValue(existing, field.name);
                  return (
                    <tr
                      key={field.name}
                      className="border-b border-line last:border-0"
                    >
                      <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-navy">
                        {field.label}
                      </td>
                      <td className="bg-soft/60 px-4 py-3 text-muted">
                        {current}
                      </td>
                      {parsed.map((offer) => {
                        const value = cellValue(offer, field.name);
                        const display =
                          field.name === "amount"
                            ? parseMoney(value) != null
                              ? formatHtTtc(
                                  value,
                                  discountsFromProposal(offer.values),
                                )
                              : "—"
                            : field.name === "simplePriceHt" ||
                                field.name === "completePriceHt" ||
                                field.name === "arrondiHt"
                              ? parseMoney(value) != null
                                ? formatHtTtc(value)
                                : "—"
                              : field.name === "rabaisPct" ||
                                  field.name === "escomptePct" ||
                                  field.name === "prorataPct"
                                ? parseMoney(value) != null
                                  ? `${formatChf(Number(parseMoney(value)))} %`
                                  : "0.00 %"
                                : value;
                        const gain = gainVsExisting(
                          field.name,
                          value,
                          existing,
                        );
                        const better = gain != null && gain > 0;
                        return (
                          <td
                            key={offer.id}
                            className={`px-4 py-3 ${
                              better
                                ? "font-semibold text-green"
                                : changed
                                  ? "font-semibold text-navy"
                                  : "text-muted"
                            }`}
                          >
                            <span>{display}</span>
                            {better ? (
                              <span className="mt-0.5 block text-[12px] font-semibold text-green">
                                Point positif
                              </span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {awardAction && !awardedOfferId ? (
                  <tr className="print:hidden">
                    <td className="sticky left-0 bg-white px-4 py-3" />
                    <td className="px-4 py-3" />
                    {parsed.map((offer) => (
                      <td key={offer.id} className="px-4 py-3">
                        {awardAction(offer.id)}
                      </td>
                    ))}
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="px-6 py-8 text-[14px] text-muted">
          Aucune offre complète pour le moment.
        </p>
      )}
    </section>
  );
}
