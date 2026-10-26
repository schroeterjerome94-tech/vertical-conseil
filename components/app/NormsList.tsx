import { selectedNormLabels } from "@/lib/norms";

export function NormsList({ extraFields }: { extraFields?: string | null }) {
  const labels = selectedNormLabels(extraFields);
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Normes applicables</h2>
      <p className="mt-1 text-[14px] text-muted">
        Références retenues pour cette installation (intitulés uniquement).
      </p>
      {labels.length ? (
        <ul className="mt-4 grid gap-2 text-[14px] text-navy">
          {labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14px] text-muted">Aucune norme indiquée.</p>
      )}
    </section>
  );
}
