import Link from "next/link";
import {
  ListFilters,
  UPDATED_SORT_FILTER,
  WORK_TYPE_FILTER,
} from "@/components/app/ListFilters";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import {
  applyInstallationFilters,
  displayParties,
  listInstallationsForUser,
  specificationWorkType,
} from "@/lib/installations";
import { requireAdmin } from "@/lib/session";

export default async function AdminInstallationsPage({
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
  const items = applyInstallationFilters(
    await listInstallationsForUser({
      role: user.role,
      userId: user.id,
      query: q,
    }),
    { workTypes: travaux, sort: tri },
  );

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy">Installations</h1>
          <p className="mt-2 text-[15px] text-muted">
            Créez les fiches techniques et attribuez-les aux gérances.
          </p>
        </div>
        <Link
          href="/espace/admin/installations/nouvelle"
          className="inline-flex h-11 items-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white"
        >
          Nouvelle installation
        </Link>
      </div>

      <ListFilters
        q={q}
        placeholder="Recherche par adresse, référence, bâtiment…"
        groups={[WORK_TYPE_FILTER, UPDATED_SORT_FILTER]}
        selected={{ travaux, tri }}
      />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="grid min-w-[860px] grid-cols-[minmax(14rem,2fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="col-span-3 grid grid-cols-subgrid items-center border-b border-line bg-soft py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
            <span className="truncate pl-4 pr-3">Adresse</span>
            <span className="truncate px-3">Type de travaux</span>
            <span className="truncate pr-4 pl-3">Propriétaire / Gérance</span>
          </div>
          {items.length ? (
            items.map((item) => {
              const parties = displayParties(item);
              return (
                <Link
                  key={item.id}
                  href={`/espace/admin/installations/${item.id}`}
                  className="col-span-3 grid grid-cols-subgrid items-center border-b border-line last:border-0 hover:bg-soft"
                >
                  <span className="py-3 pl-4 pr-3">
                    <InstallationCaption
                      address={item.buildingAddress}
                      reference={item.internalRef}
                    />
                  </span>
                  <span className="truncate px-3 py-3 text-[14px] text-muted">
                    {specificationWorkType(item.extraFields)}
                  </span>
                  <span className="truncate py-3 pr-4 pl-3 text-[14px] text-muted">
                    {parties.primary}
                    {parties.secondary ? (
                      <span className="block text-[12px]">{parties.secondary}</span>
                    ) : null}
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="col-span-3 px-4 py-8 text-[14px] text-muted">
              Aucune installation pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
