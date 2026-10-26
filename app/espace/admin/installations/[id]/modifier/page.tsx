import { notFound } from "next/navigation";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import { InstallationForm } from "@/components/app/InstallationForm";
import { updateInstallation } from "../../actions";
import {
  getAssignmentUserIds,
  getInstallationById,
  listGeranceAccounts,
} from "@/lib/installations";
import { requireAdmin } from "@/lib/session";

export default async function EditInstallationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const item = await getInstallationById(id);
  if (!item) notFound();
  const [gerances, selectedIds] = await Promise.all([
    listGeranceAccounts(),
    getAssignmentUserIds(id),
  ]);
  return (
    <div className="max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
        Modifier
      </p>
      <InstallationCaption
        as="h1"
        address={item.buildingAddress}
        reference={item.internalRef}
      />
      <p className="mt-2 text-[15px] text-muted">
        Informations générales, technique existant et attribution. Le cahier
        des charges, l’audit, la réparation et la maintenance se font depuis
        la fiche.
      </p>

      <div className="mt-10">
        <InstallationForm
          action={updateInstallation.bind(null, id)}
          values={item}
          gerances={gerances}
          selectedIds={selectedIds}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
