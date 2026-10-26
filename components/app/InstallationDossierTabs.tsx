import Link from "next/link";

export const INSTALLATION_DOSSIER_TABS = [
  { id: "cahier-des-charges", label: "Cahier des charges" },
  { id: "audit", label: "Audit" },
  { id: "reparation", label: "Réparation" },
  { id: "maintenance", label: "Maintenance" },
] as const;

export function InstallationDossierTabs({
  installationId,
  current,
}: {
  installationId: string;
  current?: string;
}) {
  const base = `/espace/admin/installations/${installationId}`;
  return (
    <nav className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
      {INSTALLATION_DOSSIER_TABS.map((tab) => {
        const active = current === tab.id;
        return (
          <Link
            key={tab.id}
            href={`${base}/${tab.id}`}
            className={`flex h-24 items-center justify-center rounded-2xl px-3 text-center text-[16px] font-semibold text-white ${
              active ? "bg-logo" : "bg-navy hover:bg-brand"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
