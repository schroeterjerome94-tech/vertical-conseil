"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { elevatorInstallation } from "@/lib/db/schema";
import { saveDocument, removeDocument, getDocumentById } from "@/lib/documents";
import { getInstallationById } from "@/lib/installations";
import { parseExtraFields, serializeExtraFields } from "@/lib/norms";
import { requireAdmin } from "@/lib/session";

function revalidateInstallationMedia(installationId: string) {
  revalidatePath(`/espace/admin/installations/${installationId}`);
  revalidatePath(`/espace/installations/${installationId}`);
  revalidatePath("/espace/appels-doffres", "layout");
}

export async function uploadDocument(
  installationId: string,
  _prev: { error: string },
  formData: FormData,
) {
  try {
    const { user } = await requireAdmin();
    const item = await getInstallationById(installationId);
    if (!item) return { error: "Installation introuvable." };
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { error: "Choisissez un fichier." };
    }
    const result = await saveDocument({
      installationId,
      actorId: user.id,
      file,
      kind: formData.get("kind"),
    });
    if (!result.error) {
      revalidateInstallationMedia(installationId);
    }
    return result;
  } catch {
    return {
      error:
        "L’envoi a échoué. Réessayez avec un fichier plus léger (JPG ou PNG).",
    };
  }
}

export async function deleteDocument(installationId: string, documentId: string) {
  const { user } = await requireAdmin();
  const item = await getInstallationById(installationId);
  if (item) {
    const extra = parseExtraFields(item.extraFields);
    if (extra.coverPhotoId === documentId) {
      extra.coverPhotoId = undefined;
      await db
        .update(elevatorInstallation)
        .set({
          extraFields: serializeExtraFields(extra),
          updatedAt: new Date(),
        })
        .where(eq(elevatorInstallation.id, installationId));
    }
  }
  await removeDocument(documentId, user.id);
  revalidateInstallationMedia(installationId);
}

export async function setCoverPhoto(installationId: string, documentId: string) {
  await requireAdmin();
  const item = await getInstallationById(installationId);
  if (!item) return;
  const document = await getDocumentById(documentId);
  if (
    !document ||
    document.installationId !== installationId ||
    document.kind !== "photo"
  ) {
    return;
  }
  const extra = parseExtraFields(item.extraFields);
  extra.coverPhotoId = documentId;
  await db
    .update(elevatorInstallation)
    .set({
      extraFields: serializeExtraFields(extra),
      updatedAt: new Date(),
    })
    .where(eq(elevatorInstallation.id, installationId));
  revalidateInstallationMedia(installationId);
}
