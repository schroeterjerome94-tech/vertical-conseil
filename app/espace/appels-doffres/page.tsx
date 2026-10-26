import Link from "next/link";
import { redirect } from "next/navigation";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { TenderFilters } from "@/components/app/TenderFilters";
import { TenderStatusBadge } from "@/components/app/TenderStatusBadge";
import { specificationWorkType } from "@/lib/dossier";
import { parseProposal } from "@/lib/offer-proposal";
import {
  applyTenderFilters,
  isTenderOpen,
  listOffersForUser,
  listTendersForUser,
} from "@/lib/tenders";
import {
  asceTenderStatusLabel,
  formatDeadline,
  isDeadlineSoon,
  TENDER_STATUS_LABEL,
} from "@/lib/tenders-ui";
import { requireUser } from "@/lib/session";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    travaux?: string | string[];
    tri?: string | string[];
  }>;
}) {
  const { user } = await requireUser();
  if (user.role === "admin") {
    redirect("/espace/admin/appels-doffres");
  }
  const { q, travaux, tri } = await searchParams;

  const listed = await listTendersForUser({
    role: user.role,
    userId: user.id,
  });
  const ownOffers =
    user.role === "ascensoriste" ? await listOffersForUser(user.id) : [];
  const ownOfferByTender = new Map(
    ownOffers.map((offer) => [
      offer.tenderId,
      {
        id: offer.id,
        submitted: parseProposal(offer.proposal).acknowledged === "oui",
      },
    ]),
  );
  const items = applyTenderFilters(listed, {
    query: q,
    workTypes: travaux,
    sort: tri,
  });
  const isGerance = user.role === "gerance";
  const alerts = !isGerance
    ? items.filter(
        ({ tender }) => isTenderOpen(tender) && isDeadlineSoon(tender.deadline),
      )
    : [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold text-navy">Appels d’offres</h1>
      <p className="mt-2 text-[15px] text-muted">
        {isGerance
          ? "Consultations lancées par Vertical Conseil sur vos installations."
          : "Consultations auxquelles vous êtes invité."}
      </p>
      {!isGerance ? (
        <p className="mt-3 text-[14px]">
          <Link
            href="/espace/appels-doffres/historique"
            className="font-semibold text-logo"
          >
            Historique de vos offres
          </Link>
        </p>
      ) : null}
      {alerts.length ? (
        <p className="mt-4 rounded-2xl border border-line bg-white px-4 py-3 text-[14px] text-navy">
          Alerte : {alerts.length === 1
            ? `l’échéance de « ${alerts[0].installation.buildingAddress || alerts[0].tender.title} » approche.`
            : `${alerts.length} consultations ont une échéance proche.`}
        </p>
      ) : null}

      <TenderFilters q={q} workTypes={travaux} sort={tri} />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="grid min-w-[860px] grid-cols-[minmax(14rem,2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]">
          <div className="col-span-4 grid grid-cols-subgrid items-center border-b border-line bg-soft py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
            <span className="truncate pl-4 pr-3">Adresse</span>
            <span className="truncate px-3">Type de travaux</span>
            <span className="truncate px-3">Échéance</span>
            <span className="truncate pr-4 pl-3">Statut</span>
          </div>
          {items.length ? (
            items.map(({ tender, installation }) => (
              <Link
                key={tender.id}
                href={`/espace/appels-doffres/${tender.id}`}
                className="col-span-4 grid grid-cols-subgrid items-center border-b border-line last:border-0 hover:bg-soft"
              >
                <span className="py-3 pl-4 pr-3">
                  <InstallationCaption
                    address={installation.buildingAddress}
                    reference={installation.internalRef}
                  />
                </span>
                <span className="truncate px-3 py-3 text-[14px] text-muted">
                  {specificationWorkType(installation.extraFields)}
                </span>
                <span className="truncate px-3 py-3 text-[14px] text-muted">
                  {formatDeadline(tender.deadline)}
                </span>
                <span className="flex items-center py-3 pr-4 pl-3">
                  <TenderStatusBadge
                    label={
                      user.role === "ascensoriste"
                        ? asceTenderStatusLabel(
                            tender,
                            ownOfferByTender.get(tender.id)?.id,
                            ownOfferByTender.get(tender.id)?.submitted,
                          )
                        : (TENDER_STATUS_LABEL[tender.status] ?? tender.status)
                    }
                  />
                </span>
              </Link>
            ))
          ) : (
            <p className="col-span-4 px-4 py-8 text-[14px] text-muted">
              Aucun appel d’offres pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
