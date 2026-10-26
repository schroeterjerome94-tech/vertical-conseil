import Link from "next/link";
import { notFound } from "next/navigation";
import { saveInstallationAudit } from "../../actions";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { getInstallationById } from "@/lib/installations";
import { parseExtraFields, TYPICAL_NORMS } from "@/lib/norms";
import { requireAdmin } from "@/lib/session";

const areaClass =
  "min-h-24 w-full rounded-2xl border border-line px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand";
const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none transition focus:border-brand";

export default async function InstallationAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const item = await getInstallationById(id);
  if (!item) notFound();
  const extra = parseExtraFields(item.extraFields);
  const selectedNorms = new Set(extra.norms ?? []);

  return (
    <div className="max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
        Audit
      </p>
      <InstallationCaption
        as="h1"
        address={item.buildingAddress}
        reference={item.internalRef}
      />
      <p className="mt-4">
        <Link
          href={`/espace/admin/installations/${id}`}
          className="text-[14px] font-semibold text-logo"
        >
          Retour à la fiche
        </Link>
      </p>

      <form action={saveInstallationAudit.bind(null, id)} className="mt-8 grid gap-6">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-navy">Relevé d’audit</h2>
          <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
            Date de l’audit
            <input
              type="date"
              name="auditDate"
              defaultValue={extra.audit?.date ?? ""}
              className={inputClass}
            />
          </label>
          <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
            Constats
            <textarea
              name="auditNotes"
              defaultValue={extra.audit?.notes ?? ""}
              className={areaClass}
            />
          </label>
          <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
            Informations de sécurité
            <textarea
              name="safetyInfo"
              defaultValue={item.safetyInfo ?? ""}
              className={areaClass}
            />
          </label>
          <label className="mt-4 grid gap-2 text-[13px] font-semibold text-navy">
            Modernisations effectuées
            <textarea
              name="modernizations"
              defaultValue={item.modernizations ?? ""}
              className={areaClass}
            />
          </label>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-navy">Normes applicables</h2>
          <p className="mt-1 text-[14px] text-muted">
            Cochez les références EN 81 et prescriptions suisses concernées. Le
            texte des normes n’est pas recopié ici.
          </p>
          <div className="mt-4 grid gap-2">
            {TYPICAL_NORMS.map((norm) => (
              <label
                key={norm.id}
                className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[14px]"
              >
                <input
                  type="checkbox"
                  name="normIds"
                  value={norm.id}
                  defaultChecked={selectedNorms.has(norm.id)}
                />
                <span className="text-navy">{norm.label}</span>
              </label>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="inline-flex h-12 w-fit items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
        >
          Enregistrer l’audit
        </button>
      </form>
    </div>
  );
}
