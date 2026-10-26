"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addTenderInvites,
  awardTender,
  closeTender,
  createTender,
  deleteTender,
  parseTenderForm,
} from "@/lib/tenders";
import { requireAdmin } from "@/lib/session";

export async function createTenderAction(formData: FormData) {
  const { user } = await requireAdmin();
  const { installationId, title, description, deadline, inviteeIds } =
    parseTenderForm(formData);
  if (!installationId || !title || !deadline) {
    throw new Error("Champs obligatoires manquants.");
  }
  if (Number.isNaN(deadline.getTime())) {
    throw new Error("Date limite invalide.");
  }
  if (!inviteeIds.length) {
    throw new Error("Invitez au moins une entreprise.");
  }
  const id = await createTender({
    actorId: user.id,
    installationId,
    title,
    description,
    deadline,
    inviteeIds,
  });
  revalidatePath("/espace/admin/appels-doffres");
  revalidatePath("/espace/appels-doffres");
  redirect(`/espace/admin/appels-doffres/${id}`);
}

export async function deleteTenderAction(id: string) {
  const { user } = await requireAdmin();
  await deleteTender(id, user.id);
  revalidatePath("/espace/admin/appels-doffres");
  revalidatePath("/espace/appels-doffres");
  revalidatePath("/espace/notifications");
}

export async function closeTenderAction(id: string) {
  const { user } = await requireAdmin();
  await closeTender(id, user.id);
  revalidatePath("/espace/admin/appels-doffres");
  revalidatePath(`/espace/admin/appels-doffres/${id}`);
  revalidatePath("/espace/appels-doffres");
}

export async function addInvitesAction(tenderId: string, formData: FormData) {
  const { user } = await requireAdmin();
  const inviteeIds = formData.getAll("inviteeIds").map(String).filter(Boolean);
  await addTenderInvites(tenderId, inviteeIds, user.id);
  revalidatePath(`/espace/admin/appels-doffres/${tenderId}`);
  revalidatePath("/espace/appels-doffres");
}

export async function awardTenderAction(tenderId: string, offerId: string) {
  const { user } = await requireAdmin();
  await awardTender(tenderId, offerId, user.id);
  revalidatePath("/espace/admin/appels-doffres");
  revalidatePath(`/espace/admin/appels-doffres/${tenderId}`);
  revalidatePath("/espace/appels-doffres");
}
