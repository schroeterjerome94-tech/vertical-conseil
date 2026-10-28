export function TenderStatusBadge({ label }: { label: string }) {
  const className =
    label === "New"
      ? "bg-emerald-50 text-emerald-800"
      : label === "Ouvert"
        ? "bg-amber-50 text-amber-800"
        : label === "Offre envoyée"
          ? "bg-sky-50 text-sky-800"
          : label === "En cours"
            ? "bg-violet-50 text-violet-800"
            : label === "Attribué"
              ? "bg-sky-50 text-sky-800"
              : label === "Clôturé"
                ? "bg-neutral-100 text-neutral-600"
                : "bg-soft text-navy";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
