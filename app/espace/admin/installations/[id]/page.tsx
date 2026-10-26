import Link from "next/link";
import { notFound } from "next/navigation";
import { InstallationView } from "@/components/app/InstallationView";
import { InstallationDossierTabs } from "@/components/app/InstallationDossierTabs";
import { InstallationMedia } from "@/components/app/InstallationMedia";
import { Photo360Prototype } from "@/components/app/Photo360Prototype";
import { isPhoto360Item } from "@/lib/photos";
import { listDocuments } from "@/lib/documents";
import { InstallationCaption } from "@/components/app/InstallationCaption";
import {
  getAssignedGeranceContacts,
  getInstallationById,
} from "@/lib/installations";
import { parseExtraFields } from "@/lib/norms";
import { requireAdmin } from "@/lib/session";

export default async function AdminInstallationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const item = await getInstallationById(id);
  if (!item) notFound();
  const [documents, geranceContacts] = await Promise.all([
    listDocuments(id),
    getAssignedGeranceContacts(id),
  ]);
  const photos360 = documents.filter(isPhoto360Item);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
            Installation
          </p>
          <InstallationCaption
            as="h1"
            address={item.buildingAddress}
            reference={item.internalRef}
          />
        </div>
        <Link
          href={`/espace/admin/installations/${id}/modifier`}
          className="inline-flex h-11 items-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white"
        >
          Modifier
        </Link>
      </div>

      <div className="mt-8">
        <InstallationView item={item} geranceContacts={geranceContacts} />
      </div>

      <InstallationDossierTabs installationId={id} />

      <Photo360Prototype
        photos={photos360}
        installationId={id}
        canEdit
      />
      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit
        kinds={["video"]}
      />
      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit
        kinds={["photo"]}
        coverPhotoId={parseExtraFields(item.extraFields).coverPhotoId}
      />
      <InstallationMedia
        installationId={id}
        documents={documents}
        canEdit
        kinds={["plan"]}
      />
    </div>
  );
}
