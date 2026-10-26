import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { AccountStatus, UserRole } from "./constants";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  const user = session.user as typeof session.user & {
    role: UserRole;
    status: AccountStatus;
    organizationName?: string | null;
    accountKind?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  return { ...session, user };
}

export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/connexion");
  if (current.user.status !== "approved") {
    redirect("/compte-en-attente");
  }
  return current;
}

export async function requireAdmin() {
  const current = await requireUser();
  if (current.user.role !== "admin") {
    redirect("/espace");
  }
  return current;
}

export async function requireGerance() {
  const current = await requireUser();
  if (current.user.role !== "gerance" && current.user.role !== "admin") {
    redirect("/espace");
  }
  return current;
}

export async function requireAscensoriste() {
  const current = await requireUser();
  if (current.user.role !== "ascensoriste" && current.user.role !== "admin") {
    redirect("/espace");
  }
  return current;
}
