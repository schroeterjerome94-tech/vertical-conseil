import Link from "next/link";
import {
  ListFilters,
  UPDATED_SORT_FILTER,
} from "@/components/app/ListFilters";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import {
  applyInstallationFilters,
  listInstallationsForUser,
} from "@/lib/installations";
import { requireGerance } from "@/lib/session";

export default async function GeranceInstallationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tri?: string | string[];
  }>;
}) {
  const { user } = await requireGerance();
  const { q, tri } = await searchParams;
  const items = applyInstallationFilters(
    await listInstallationsForUser({
      role: user.role === "admin" ? "admin" : "gerance",
      userId: user.id,
      query: q,
    }),
    { sort: tri },
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold text-navy">Mes installations</h1>
      <p className="mt-2 text-[15px] text-muted">
        Consultez les fiches qui vous sont attribuées. Les données techniques
        ne sont pas modifiables.
      </p>

      <ListFilters
        q={q}
        placeholder="Recherche par adresse ou bâtiment…"
        groups={[UPDATED_SORT_FILTER]}
        selected={{ tri }}
      />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="grid min-w-[52rem] grid-cols-[minmax(16rem,2fr)_minmax(13rem,1fr)_minmax(12rem,1fr)]">
          <div className="col-span-3 grid grid-cols-subgrid items-center border-b border-line bg-soft py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
            <span className="pl-4 pr-3">Adresse</span>
            <span className="whitespace-nowrap px-3 text-center">
              Année de construction
            </span>
            <span className="whitespace-nowrap pr-4 pl-3 text-center">
              Nombre de niveaux
            </span>
          </div>
          {items.length ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/espace/installations/${item.id}`}
                className="col-span-3 grid grid-cols-subgrid items-center border-b border-line last:border-0 hover:bg-soft"
              >
                <span className="py-3 pl-4 pr-3">
                  <InstallationCaption
                    address={item.buildingAddress}
                    reference={item.internalRef}
                  />
                </span>
                <span className="truncate px-3 py-3 text-center text-[14px] text-muted">
                  {item.commissioningYear?.trim() || "—"}
                </span>
                <span className="truncate py-3 pr-4 pl-3 text-center text-[14px] text-muted">
                  {item.stopCount?.trim() || "—"}
                </span>
              </Link>
            ))
          ) : (
            <p className="col-span-3 px-4 py-8 text-[14px] text-muted">
              Aucune installation attribuée pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
