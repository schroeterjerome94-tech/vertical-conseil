import Link from "next/link";
import { AdminTenderRow } from "@/components/app/AdminTenderRow";
import { TenderFilters } from "@/components/app/TenderFilters";
import { specificationWorkType } from "@/lib/dossier";
import { applyTenderFilters, listTendersForUser } from "@/lib/tenders";
import { formatDeadline, TENDER_STATUS_LABEL } from "@/lib/tenders-ui";
import { requireAdmin } from "@/lib/session";

export default async function AdminTendersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    travaux?: string | string[];
    tri?: string | string[];
  }>;
}) {
  const { user } = await requireAdmin();
  const { q, travaux, tri } = await searchParams;
  const items = applyTenderFilters(
    await listTendersForUser({
      role: user.role,
      userId: user.id,
    }),
    {
      query: q,
      workTypes: travaux,
      sort: tri,
    },
  );

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy">Appels d’offres</h1>
          <p className="mt-2 text-[15px] text-muted">
            Seul Vertical Conseil lance les consultations et invite les
            entreprises.
          </p>
        </div>
        <Link
          href="/espace/admin/installations"
          className="inline-flex h-11 items-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white"
        >
          Nouvel appel d’offres
        </Link>
      </div>

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
              <AdminTenderRow
                key={tender.id}
                id={tender.id}
                href={`/espace/admin/appels-doffres/${tender.id}`}
                address={installation.buildingAddress}
                reference={installation.internalRef}
                workType={specificationWorkType(installation.extraFields)}
                deadline={formatDeadline(tender.deadline)}
                statusLabel={TENDER_STATUS_LABEL[tender.status] ?? tender.status}
              />
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
