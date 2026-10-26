export const TENDER_STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  closed: "Clôturé",
  awarded: "Attribué",
};

export function asceTenderStatusLabel(
  tender: {
    status: string;
    awardedOfferId?: string | null;
    deadline?: Date | string | number;
  },
  ownOfferId?: string | null,
  submitted?: boolean,
) {
  if (tender.status === "awarded") {
    return ownOfferId && tender.awardedOfferId === ownOfferId
      ? "Attribué"
      : "Clôturé";
  }
  const deadline = tender.deadline ? new Date(tender.deadline).getTime() : NaN;
  const deadlinePassed =
    tender.status === "closed" ||
    (!Number.isNaN(deadline) && deadline <= Date.now());
  if (deadlinePassed) return "En cours";
  if (submitted) return "Offre envoyée";
  if (ownOfferId) return "Ouvert";
  return "New";
}

export function tenderStatusClass(label: string) {
  if (label === "New") return "bg-emerald-50 text-emerald-800";
  if (label === "Ouvert") return "bg-amber-50 text-amber-800";
  if (label === "Offre envoyée") return "bg-sky-50 text-sky-800";
  if (label === "En cours") return "bg-violet-50 text-violet-800";
  if (label === "Attribué") return "bg-sky-50 text-sky-800";
  if (label === "Clôturé") return "bg-neutral-100 text-neutral-600";
  return "bg-soft text-navy";
}

export function formatDeadline(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isDeadlineSoon(value: Date | string | number, days = 7) {
  const date = value instanceof Date ? value : new Date(value);
  const remaining = date.getTime() - Date.now();
  return remaining > 0 && remaining <= days * 24 * 60 * 60 * 1000;
}
