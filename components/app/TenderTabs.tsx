import Link from "next/link";

export function TenderTabs({
  href,
  current,
  tabs,
  editHref,
}: {
  href: string;
  current: string;
  tabs: { id: string; label: string }[];
  editHref?: string;
}) {
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line print:hidden">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = current === tab.id;
          return (
            <Link
              key={tab.id}
              href={`${href}?onglet=${tab.id}`}
              className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold ${
                active
                  ? "border-logo text-navy"
                  : "border-transparent text-muted hover:text-navy"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {(current === "cahier" || current === "info") && editHref ? (
        <Link
          href={editHref}
          className="mb-2 inline-flex h-10 items-center rounded-full bg-logo px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(0,41,142,0.18)] transition hover:bg-navy"
        >
          Modifier
        </Link>
      ) : null}
    </nav>
  );
}
