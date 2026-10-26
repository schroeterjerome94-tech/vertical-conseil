import Image from "next/image";
import { TenderStatusBadge } from "@/components/app/TenderStatusBadge";

const GERANCE_NAV = [
  "Tableau de bord",
  "Mes installations",
  "Appels d’offres",
  "Formule",
  "Compte",
];

const ASCE_NAV = [
  "Tableau de bord",
  "Appels d’offres",
  "Formule",
  "Compte",
];

const INSTALLATIONS = [
  {
    address: "Rue du Rhône 12, 1204 Genève",
    reference: "Genève — Rhône 12",
    year: "1986",
    levels: "8",
  },
  {
    address: "Avenue de la Gare 26, 1001 Lausanne",
    reference: "Lausanne — Gare 26",
    year: "1994",
    levels: "6",
  },
  {
    address: "Chemin des Pâquis 8, 1033 Cheseaux",
    reference: "Cheseaux — Pâquis 8",
    year: "2001",
    levels: "4",
  },
  {
    address: "Route de Nyon 50, 1260 Nyon",
    reference: "Nyon — Route 50",
    year: "1978",
    levels: "10",
  },
];

const TENDERS = [
  {
    address: "Rue du Rhône 12, 1204 Genève",
    reference: "AO-2026-014",
    work: "Remplacement",
    deadline: "12 novembre 2026",
    status: "New",
  },
  {
    address: "Avenue de la Gare 26, 1001 Lausanne",
    reference: "AO-2026-018",
    work: "Modernisation",
    deadline: "20 novembre 2026",
    status: "Ouvert",
  },
  {
    address: "Route de Nyon 50, 1260 Nyon",
    reference: "AO-2026-021",
    work: "Remplacement",
    deadline: "28 novembre 2026",
    status: "Offre envoyée",
  },
];

function FakeFilters({ placeholder }: { placeholder: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex h-11 w-full max-w-md items-center rounded-2xl border border-line bg-white px-4 text-[15px] text-muted">
        {placeholder}
      </div>
      <div className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-[14px] font-semibold text-navy">
        Filtrer
      </div>
    </div>
  );
}

export function PlatformPreview({
  kind,
}: {
  kind: "gerance" | "ascensoriste";
}) {
  const gerance = kind === "gerance";
  const nav = gerance ? GERANCE_NAV : ASCE_NAV;
  const current = gerance ? "Mes installations" : "Appels d’offres";

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-line bg-[#f7f9fc] shadow-[0_24px_60px_rgba(7,29,68,0.08)]"
      aria-hidden
    >
      <div className="relative aspect-[5/4] w-full">
        <div className="absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50">
          <div className="flex h-full min-h-[720px] bg-[#f7f9fc]">
            <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-white px-5 py-6">
              <div className="px-1">
                <Image
                  src="/brand/logo-transparent.png"
                  alt=""
                  width={320}
                  height={96}
                  className="h-16 w-auto"
                  unoptimized
                />
              </div>
              <nav className="mt-8 grid flex-1 content-start gap-1">
                {nav.map((item) => (
                  <span
                    key={item}
                    className={`rounded-xl px-3 py-2 text-[14px] font-semibold text-navy ${
                      item === current ? "bg-soft" : ""
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </nav>
              <div className="mt-8 border-t border-line pt-4">
                <p className="px-3 text-[13px] font-semibold text-navy">
                  {gerance ? "Régie du Léman" : "Ascenseurs Dupont"}
                </p>
                <p className="px-3 text-[12px] capitalize text-muted">
                  {kind}
                </p>
                <p className="mt-3 px-3 text-[14px] font-semibold text-muted">
                  Se déconnecter
                </p>
              </div>
            </aside>
            <main className="min-w-0 flex-1 px-8 py-8">
              {gerance ? (
                <div className="max-w-5xl">
                  <h1 className="text-3xl font-semibold text-navy">
                    Mes installations
                  </h1>
                  <p className="mt-2 text-[15px] text-muted">
                    Consultez les fiches qui vous sont attribuées. Les données
                    techniques ne sont pas modifiables.
                  </p>
                  <FakeFilters placeholder="Recherche par adresse ou bâtiment…" />
                  <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="grid grid-cols-[minmax(16rem,2fr)_minmax(13rem,1fr)_minmax(12rem,1fr)]">
                      <div className="col-span-3 grid grid-cols-subgrid items-center border-b border-line bg-soft py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
                        <span className="pl-4 pr-3">Adresse</span>
                        <span className="whitespace-nowrap px-3 text-center">
                          Année de construction
                        </span>
                        <span className="whitespace-nowrap pr-4 pl-3 text-center">
                          Nombre de niveaux
                        </span>
                      </div>
                      {INSTALLATIONS.map((row) => (
                        <div
                          key={row.address}
                          className="col-span-3 grid grid-cols-subgrid items-center border-b border-line last:border-0"
                        >
                          <span className="py-3 pl-4 pr-3 text-[14px] font-semibold text-navy">
                            {row.address}
                            <span className="mt-0.5 block text-[12px] font-normal text-muted">
                              {row.reference}
                            </span>
                          </span>
                          <span className="truncate px-3 py-3 text-center text-[14px] text-muted">
                            {row.year}
                          </span>
                          <span className="truncate py-3 pr-4 pl-3 text-center text-[14px] text-muted">
                            {row.levels}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl">
                  <h1 className="text-3xl font-semibold text-navy">
                    Appels d’offres
                  </h1>
                  <p className="mt-2 text-[15px] text-muted">
                    Consultations auxquelles vous êtes invité.
                  </p>
                  <FakeFilters placeholder="Recherche par adresse, référence ou type de travaux…" />
                  <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="grid grid-cols-[minmax(14rem,2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]">
                      <div className="col-span-4 grid grid-cols-subgrid items-center border-b border-line bg-soft py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
                        <span className="truncate pl-4 pr-3">Adresse</span>
                        <span className="truncate px-3">Type de travaux</span>
                        <span className="truncate px-3">Échéance</span>
                        <span className="truncate pr-4 pl-3">Statut</span>
                      </div>
                      {TENDERS.map((row) => (
                        <div
                          key={row.reference}
                          className="col-span-4 grid grid-cols-subgrid items-center border-b border-line last:border-0"
                        >
                          <span className="py-3 pl-4 pr-3 text-[14px] font-semibold text-navy">
                            {row.address}
                            <span className="mt-0.5 block text-[12px] font-normal text-muted">
                              {row.reference}
                            </span>
                          </span>
                          <span className="truncate px-3 py-3 text-[14px] text-muted">
                            {row.work}
                          </span>
                          <span className="truncate px-3 py-3 text-[14px] text-muted">
                            {row.deadline}
                          </span>
                          <span className="flex items-center py-3 pr-4 pl-3">
                            <TenderStatusBadge label={row.status} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
