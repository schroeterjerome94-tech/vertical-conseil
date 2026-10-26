"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";

export async function updateProfileAction(formData: FormData) {
  const { user: current } = await requireUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const name = `${firstName} ${lastName}`.trim();
  const organizationName =
    String(formData.get("organizationName") ?? "").trim() || null;
  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont obligatoires.");
  }
  if (!phone) {
    throw new Error("Le numéro de téléphone est obligatoire.");
  }
  if (!address) {
    throw new Error("L’adresse est obligatoire.");
  }
  await db
    .update(user)
    .set({
      name,
      firstName,
      lastName,
      phone,
      address,
      organizationName,
      updatedAt: new Date(),
    })
    .where(eq(user.id, current.id));
  await auth.api.updateUser({
    body: { name, firstName, lastName, phone, address },
    headers: await headers(),
  });
  revalidatePath("/espace");
  revalidatePath("/espace/compte");
}

export async function changePasswordAction(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }
  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    });
  } catch {
    return { error: "Mot de passe actuel incorrect." };
  }
  revalidatePath("/espace/compte");
  return { error: "" };
}
