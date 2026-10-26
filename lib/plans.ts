import "server-only";

import { desc, eq, ne } from "drizzle-orm";
import type { AccountPlan, UserRole } from "./constants";
import { db } from "./db";
import { user } from "./db/schema";
import { notifyAdmins, notifyByEmail } from "./notices";
import { logAudit } from "./installations";

const origin = () => process.env.BETTER_AUTH_URL || "http://localhost:3000";

export function isPro(role: UserRole, plan: AccountPlan | string | null | undefined) {
  return role === "admin" || plan === "pro";
}

export function geranceDocumentKinds(pro: boolean) {
  return pro
    ? (["plan", "photo", "video", "photo360", "releve", "rapport", "autre"] as const)
    : [];
}

export function asceDocumentKinds(pro: boolean) {
  return pro ? (["plan", "photo", "video", "photo360"] as const) : [];
}

export async function getAccountPlan(userId: string): Promise<{
  plan: AccountPlan;
  planRequested: boolean;
}> {
  const [row] = await db
    .select({ plan: user.plan, planRequested: user.planRequested })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return {
    plan: row?.plan === "pro" ? "pro" : "free",
    planRequested: Boolean(row?.planRequested),
  };
}

export async function listAccountsForPlans() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationName: user.organizationName,
      role: user.role,
      status: user.status,
      plan: user.plan,
      planRequested: user.planRequested,
    })
    .from(user)
    .where(ne(user.role, "admin"))
    .orderBy(desc(user.planRequested), desc(user.updatedAt));
}

export async function setAccountPlan(
  actorId: string,
  userId: string,
  plan: AccountPlan,
) {
  await db
    .update(user)
    .set({
      plan,
      planRequested: false,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
  await logAudit(actorId, `plan_${plan}`, userId);

  const [account] = await db
    .select({ email: user.email, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (account) {
    const asce = account.role === "ascensoriste";
    await notifyByEmail(
      account.email,
      plan === "pro"
        ? asce
          ? "Votre version Pro est active"
          : "Votre abonnement Pro est actif"
        : "Votre espace est en version gratuite",
      `${origin()}/espace/formule`,
    );
  }
}

export async function requestProPlan(userId: string, name: string, email: string) {
  const [account] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  await db
    .update(user)
    .set({ planRequested: true, updatedAt: new Date() })
    .where(eq(user.id, userId));
  const asce = account?.role === "ascensoriste";
  await notifyAdmins(
    asce
      ? `Demande de version Pro — ${name} (${email})`
      : `Demande d’abonnement Pro — ${name} (${email})`,
    `${origin()}/espace/admin/inscriptions`,
  );
}
