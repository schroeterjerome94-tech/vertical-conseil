import { notFound } from "next/navigation";
import { InstallationView } from "@/components/app/InstallationView";
import { InstallationMedia } from "@/components/app/InstallationMedia";
import { Photo360Prototype } from "@/components/app/Photo360Prototype";
import { parseExtraFields } from "@/lib/norms";
import { isPhoto360Item } from "@/lib/photos";
import { filterDocumentsForRole, listDocuments } from "@/lib/documents";
import { getAccountPlan, isPro } from "@/lib/plans";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import {
  getAssignedGeranceContacts,
  getInstallationById,
  userCanViewInstallation,
} from "@/lib/installations";
import { requireGerance } from "@/lib/session";

export default async function GeranceInstallationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireGerance();
  const { id } = await params;
  const allowed = await userCanViewInstallation(user.role, user.id, id);
  if (!allowed) notFound();
  const item = await getInstallationById(id);
  if (!item) notFound();
  const [{ plan }, allDocuments, geranceContacts] = await Promise.all([
    getAccountPlan(user.id),
    listDocuments(id),
    getAssignedGeranceContacts(id),
  ]);
  const pro = isPro(user.role, plan);
  const documents = filterDocumentsForRole(user.role, pro, allDocuments);
  const photos360 = documents.filter(isPhoto360Item);
  const coverPhotoId = parseExtraFields(item.extraFields).coverPhotoId;

  return (
    <div className="max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
        Fiche technique
      </p>
      <InstallationCaption
        as="h1"
        address={item.buildingAddress}
        reference={item.internalRef}
      />
      <p className="mt-2 text-[14px] text-muted">Consultation uniquement.</p>
      <div className="mt-8">
        <InstallationView item={item} geranceContacts={geranceContacts} />
      </div>

      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit={false}
        kinds={["photo"]}
        coverPhotoId={coverPhotoId}
        lockedKinds={pro ? [] : ["photo"]}
      />
      <Photo360Prototype photos={photos360} locked={!pro} />
      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit={false}
        kinds={["video"]}
        lockedKinds={pro ? [] : ["video"]}
      />
      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit={false}
        kinds={["plan"]}
        lockedKinds={pro ? [] : ["plan"]}
      />
    </div>
  );
}
