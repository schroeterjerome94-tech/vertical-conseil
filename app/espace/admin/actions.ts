"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { AccountPlan } from "@/lib/constants";
import { db } from "@/lib/db";
import {
  account,
  installationAssignment,
  notice,
  session,
  tenderInvite,
  tenderOffer,
  user,
} from "@/lib/db/schema";
import { setAccountPlan } from "@/lib/plans";
import { requireAdmin } from "@/lib/session";

export async function setAccountStatus(
  userId: string,
  status: "approved" | "refused" | "suspended",
) {
  await requireAdmin();
  await db
    .update(user)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === "approved" ? { emailVerified: true } : {}),
    })
    .where(eq(user.id, userId));
  revalidatePath("/espace/admin/inscriptions");
  revalidatePath("/espace", "layout");
}

export async function deleteAccountAction(userId: string) {
  const { user: admin } = await requireAdmin();
  if (admin.id === userId) return;
  const [row] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!row || row.role === "admin") return;
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(account).where(eq(account.userId, userId));
  await db.delete(notice).where(eq(notice.userId, userId));
  await db.delete(installationAssignment).where(eq(installationAssignment.userId, userId));
  await db.delete(tenderInvite).where(eq(tenderInvite.userId, userId));
  await db.delete(tenderOffer).where(eq(tenderOffer.userId, userId));
  await db.delete(user).where(eq(user.id, userId));
  revalidatePath("/espace/admin/inscriptions");
  revalidatePath("/espace", "layout");
}

export async function setPlanAction(userId: string, plan: AccountPlan) {
  const { user: admin } = await requireAdmin();
  await setAccountPlan(admin.id, userId, plan);
  revalidatePath("/espace/admin/inscriptions");
  revalidatePath("/espace/formule");
  revalidatePath("/espace", "layout");
}
