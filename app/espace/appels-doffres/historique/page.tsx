import Link from "next/link";
import {
  DATE_SORT_FILTER,
  ListFilters,
} from "@/components/app/ListFilters";
import { dateSortDirection } from "@/lib/list-sort";
import { requireAscensoriste } from "@/lib/session";
import {
  discountsFromProposal,
  isOfferComplete,
  parseProposal,
} from "@/lib/offer-proposal";
import { formatHtTtc } from "@/lib/money";
import { listOffersForUser } from "@/lib/tenders";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { TenderStatusBadge } from "@/components/app/TenderStatusBadge";
import { asceTenderStatusLabel, formatDeadline } from "@/lib/tenders-ui";

export default async function OfferHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tri?: string | string[];
  }>;
}) {
  const { user } = await requireAscensoriste();
  const { q, tri } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const direction = dateSortDirection(tri);
  const offers = (await listOffersForUser(user.id))
    .filter((offer) => {
      if (!query) return true;
      return [
          offer.buildingAddress,
          offer.internalRef,
          offer.title,
          offer.amount,
          offer.status,
        ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort(
      (a, b) =>
        (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) *
        direction,
    );

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold text-navy">
        Historique de vos offres
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Suivi détaillé de vos soumissions en ligne.
      </p>
      <ListFilters
        q={q}
        placeholder="Recherche par adresse ou référence…"
        groups={[DATE_SORT_FILTER]}
        selected={{ tri }}
      />
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="grid min-w-[640px] grid-cols-4 border-b border-line bg-soft px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
          <span>Adresse</span>
          <span>Montant</span>
          <span>Échéance</span>
          <span>Statut</span>
        </div>
        {offers.length ? (
          offers.map((offer) => {
            const complete = isOfferComplete(
              offer.amount,
              parseProposal(offer.proposal),
            );
            return (
              <Link
                key={offer.id}
                href={`/espace/appels-doffres/${offer.tenderId}`}
                className="grid min-w-[640px] grid-cols-4 border-b border-line px-4 py-3 text-[14px] last:border-0 hover:bg-soft"
              >
                <InstallationCaption
                  address={offer.buildingAddress}
                  reference={offer.internalRef}
                />
                <span
                  className={
                    complete ? "text-navy" : "font-semibold text-red-600"
                  }
                >
                  {complete
                    ? formatHtTtc(
                        offer.amount,
                        discountsFromProposal(parseProposal(offer.proposal)),
                      )
                    : "Incomplet"}
                </span>
                <span className="text-muted">
                  {formatDeadline(offer.deadline)}
                </span>
                <span>
                  <TenderStatusBadge
                    label={asceTenderStatusLabel(
                      offer,
                      offer.id,
                      parseProposal(offer.proposal).acknowledged === "oui",
                    )}
                  />
                </span>
              </Link>
            );
          })
        ) : (
          <p className="px-4 py-8 text-[14px] text-muted">
            Aucune offre pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
