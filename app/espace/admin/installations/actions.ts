"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { elevatorInstallation } from "@/lib/db/schema";
import {
  getInstallationById,
  logAudit,
  nextInternalRef,
  parseInstallationForm,
  replaceAssignments,
} from "@/lib/installations";
import { attachRequestToInstallation } from "@/lib/requests";
import { parseExtraFields, serializeExtraFields } from "@/lib/norms";
import { parseSpecificationForm } from "@/lib/specification";
import { requireAdmin } from "@/lib/session";
import { removeInstallationFiles } from "@/lib/documents";
import { notifyAscensoristesOfSpecificationChange } from "@/lib/tenders";

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

export async function createInstallation(formData: FormData) {
  const { user } = await requireAdmin();
  const { data, assigneeIds } = parseInstallationForm(formData);
  const id = crypto.randomUUID();
  const now = new Date();
  data.internalRef = await nextInternalRef();
  await db.insert(elevatorInstallation).values({
    id,
    ...data,
    extraFields: serializeExtraFields({}),
    createdAt: now,
    updatedAt: now,
  });
  await replaceAssignments(id, assigneeIds);
  await logAudit(user.id, "create", id, data.internalRef ?? undefined);
  const requestId = String(formData.get("requestId") ?? "").trim();
  if (requestId) {
    await attachRequestToInstallation(requestId, id);
    revalidatePath("/espace/admin/demandes");
    revalidatePath("/espace/demandes");
    revalidatePath("/espace", "layout");
  }
  revalidatePath("/espace/admin/installations");
  redirect(`/espace/admin/installations/${id}`);
}

export async function updateInstallation(id: string, formData: FormData) {
  const { user } = await requireAdmin();
  const { data, assigneeIds } = parseInstallationForm(formData);
  const { internalRef: _internalRef, ...rest } = data;
  await db
    .update(elevatorInstallation)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(elevatorInstallation.id, id));
  await replaceAssignments(id, assigneeIds);
  await logAudit(user.id, "update", id);
  revalidatePath("/espace/admin/installations");
  revalidatePath(`/espace/admin/installations/${id}`);
  revalidatePath("/espace/installations");
  redirect(`/espace/admin/installations/${id}`);
}

export async function saveInstallationAudit(id: string, formData: FormData) {
  const { user } = await requireAdmin();
  const item = await getInstallationById(id);
  if (!item) return;
  const extra = parseExtraFields(item.extraFields);
  extra.norms = formData.getAll("normIds").map(String).filter(Boolean);
  extra.audit = {
    date: String(formData.get("auditDate") ?? "").trim(),
    notes: String(formData.get("auditNotes") ?? "").trim(),
  };
  await db
    .update(elevatorInstallation)
    .set({
      safetyInfo: emptyToNull(formData.get("safetyInfo")),
      modernizations: emptyToNull(formData.get("modernizations")),
      extraFields: serializeExtraFields(extra),
      updatedAt: new Date(),
    })
    .where(eq(elevatorInstallation.id, id));
  await logAudit(user.id, "audit", id);
  revalidatePath(`/espace/admin/installations/${id}`);
  revalidatePath(`/espace/admin/installations/${id}/audit`);
  redirect(`/espace/admin/installations/${id}/audit`);
}

export async function saveInstallationFollowUp(
  id: string,
  kind: "repair" | "maintenance",
  formData: FormData,
) {
  const { user } = await requireAdmin();
  const item = await getInstallationById(id);
  if (!item) return;
  const extra = parseExtraFields(item.extraFields);
  extra[kind] = {
    date: String(formData.get("followUpDate") ?? "").trim(),
    notes: String(formData.get("followUpNotes") ?? "").trim(),
  };
  await db
    .update(elevatorInstallation)
    .set({
      extraFields: serializeExtraFields(extra),
      updatedAt: new Date(),
    })
    .where(eq(elevatorInstallation.id, id));
  await logAudit(user.id, kind, id);
  const path = kind === "repair" ? "reparation" : "maintenance";
  revalidatePath(`/espace/admin/installations/${id}`);
  revalidatePath(`/espace/admin/installations/${id}/${path}`);
  redirect(`/espace/admin/installations/${id}/${path}`);
}

function safeReturnPath(value: string) {
  if (!value.startsWith("/espace/admin/")) return null;
  if (value.includes("://") || value.includes("\\")) return null;
  return value;
}

export async function saveInstallationSpecification(id: string, formData: FormData) {
  const { user } = await requireAdmin();
  const item = await getInstallationById(id);
  if (!item) return;
  const extra = parseExtraFields(item.extraFields);
  const specification = parseSpecificationForm(formData);
  extra.specification = specification;
  await db
    .update(elevatorInstallation)
    .set({
      extraFields: serializeExtraFields(extra),
      updatedAt: new Date(),
    })
    .where(eq(elevatorInstallation.id, id));
  await logAudit(user.id, "specification", id, specification.title);
  await notifyAscensoristesOfSpecificationChange(id);
  revalidatePath(`/espace/admin/installations/${id}`);
  revalidatePath(`/espace/admin/installations/${id}/cahier-des-charges`);
  revalidatePath("/espace/appels-doffres");
  revalidatePath("/espace/notifications");
  const next =
    safeReturnPath(String(formData.get("returnTo") ?? "").trim()) ??
    `/espace/admin/installations/${id}/cahier-des-charges`;
  redirect(next);
}

export async function deleteInstallation(id: string) {
  const { user } = await requireAdmin();
  await db.delete(elevatorInstallation).where(eq(elevatorInstallation.id, id));
  await removeInstallationFiles(id);
  await logAudit(user.id, "delete", id);
  revalidatePath("/espace/admin/installations");
  revalidatePath("/espace/installations");
  redirect("/espace/admin/installations");
}
