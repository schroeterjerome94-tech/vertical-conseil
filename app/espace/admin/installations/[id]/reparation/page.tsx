import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallationFollowUpForm } from "@/components/app/InstallationFollowUpForm";
import { saveInstallationFollowUp } from "../../actions";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { getInstallationById } from "@/lib/installations";
import { parseExtraFields } from "@/lib/norms";
import { requireAdmin } from "@/lib/session";

export default async function InstallationRepairPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const item = await getInstallationById(id);
  if (!item) notFound();
  const extra = parseExtraFields(item.extraFields);

  return (
    <div className="max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
        Réparation
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
      <InstallationFollowUpForm
        action={saveInstallationFollowUp.bind(null, id, "repair")}
        title="Réparation"
        dateLabel="Date"
        notesLabel="Notes"
        submitLabel="Enregistrer"
        date={extra.repair?.date}
        notes={extra.repair?.notes}
      />
    </div>
  );
}
