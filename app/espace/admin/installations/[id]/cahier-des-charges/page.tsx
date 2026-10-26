import Link from "next/link";
import { notFound } from "next/navigation";
import { CahierDesCharges } from "@/components/app/CahierDesCharges";
import { SpecificationForm } from "@/components/app/SpecificationForm";
import { saveInstallationSpecification } from "../../actions";
import { SPEC_PURPOSES } from "@/lib/dossier";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { getInstallationById } from "@/lib/installations";
import { parseExtraFields } from "@/lib/norms";
import {
  characteristicsFromExisting,
  DIMENSION_DISCLAIMER,
  parseCharacteristics,
  specificationHasContent,
} from "@/lib/specification";
import { requireAdmin } from "@/lib/session";
import { listDocuments } from "@/lib/documents";
import { SpecificationMediaPicker } from "@/components/app/SpecificationMediaPicker";

export default async function InstallationSpecificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retour?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { retour } = await searchParams;
  const backHref =
    retour?.startsWith("/espace/admin/") &&
    !retour.includes("://") &&
    !retour.includes("\\")
      ? retour
      : `/espace/admin/installations/${id}`;
  const backLabel = retour?.startsWith("/espace/admin/appels-doffres/")
    ? "Retour à l’appel d’offres"
    : "Retour à la fiche";
  const item = await getInstallationById(id);
  if (!item) notFound();
  const documents = await listDocuments(id);
  const extra = parseExtraFields(item.extraFields);
  const spec = extra.specification;
  const saved = specificationHasContent(spec);
  const characteristics = saved
    ? parseCharacteristics(spec?.characteristics)
    : characteristicsFromExisting(item as unknown as Record<string, unknown>);
  if (!characteristics.notes) {
    characteristics.notes = spec?.content || DIMENSION_DISCLAIMER;
  }

  return (
    <div className="max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand print:hidden">
        Cahier des charges
      </p>
      <div className="print:hidden">
        <InstallationCaption
          as="h1"
          address={item.buildingAddress}
          reference={item.internalRef}
        />
      </div>
      <p className="mt-4 print:hidden">
        <Link
          href={backHref}
          className="text-[14px] font-semibold text-logo"
        >
          {backLabel}
        </Link>
      </p>

      {saved ? (
        <div className="mt-8 hidden print:block">
          <CahierDesCharges
            installation={item}
            spec={spec}
            documents={documents}
          />
        </div>
      ) : null}

      <form
        action={saveInstallationSpecification.bind(null, id)}
        className="mt-8 grid gap-6 print:hidden"
      >
        {backHref.startsWith("/espace/admin/appels-doffres/") ? (
          <input type="hidden" name="returnTo" value={backHref} />
        ) : null}
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-navy">Objet</h2>
          <p className="mt-1 text-[14px] text-muted">
            Choisissez s’il s’agit d’un remplacement ou d’une modernisation.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SPEC_PURPOSES.map((itemPurpose) => (
              <label
                key={itemPurpose.value}
                className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[14px] font-semibold text-navy"
              >
                <input
                  type="radio"
                  name="purpose"
                  value={itemPurpose.value}
                  defaultChecked={
                    (spec?.purpose ?? "remplacement") === itemPurpose.value
                  }
                  required
                />
                {itemPurpose.label}
              </label>
            ))}
          </div>
        </section>

        <SpecificationForm
          values={characteristics}
          selectedClauses={spec?.selectedClauses}
        />

        <SpecificationMediaPicker
          documents={documents}
          selectedIds={spec?.mediaIds}
        />

        <section className="rounded-3xl bg-navy p-6 text-white">
          <h2 className="text-lg font-semibold">
            Points importants à prendre en compte
          </h2>
          <p className="mt-1 text-[14px] text-white/70">
            Affiché dans l’onglet Information de l’appel d’offres.
          </p>
          <textarea
            name="importantNotes"
            defaultValue={spec?.importantNotes ?? ""}
            rows={5}
            className="mt-4 w-full rounded-2xl border-0 bg-white px-4 py-3 text-[15px] font-normal text-navy outline-none"
          />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex h-12 items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
          >
            Enregistrer le cahier des charges
          </button>
          <Link
            href={`/espace/admin/appels-doffres/nouveau?installationId=${id}`}
            className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[14px] font-semibold text-navy"
          >
            Lancer un appel d’offres
          </Link>
        </div>
      </form>
    </div>
  );
}
