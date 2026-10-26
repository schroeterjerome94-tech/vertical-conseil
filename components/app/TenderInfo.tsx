function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const text = value?.trim() || "—";
  return (
    <div className="grid gap-1 border-b border-line py-4 last:border-0 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-navy">{text}</p>
    </div>
  );
}

export function TenderInfo({
  owner,
  gerance,
  access,
  deadline,
  notes,
}: {
  owner?: string | null;
  gerance?: string | null;
  access?: string | null;
  deadline: string;
  notes?: string | null;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Information</h2>
      <div className="mt-2">
        <InfoRow label="Propriétaire" value={owner} />
        <InfoRow label="Gérance" value={gerance} />
        <InfoRow label="Code d’accès du bâtiment" value={access} />
        <InfoRow label="Date de retour des soumissions" value={deadline} />
        <InfoRow
          label="Points importants à prendre en compte"
          value={notes}
        />
      </div>
    </section>
  );
}
