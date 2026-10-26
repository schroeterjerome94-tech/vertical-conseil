"use server";

import { revalidatePath } from "next/cache";
import { requestProPlan } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export async function requestProAction() {
  const { user } = await requireUser();
  if (user.role !== "gerance") return;
  await requestProPlan(user.id, user.name, user.email);
  revalidatePath("/espace/formule");
  revalidatePath("/espace/admin/inscriptions");
  revalidatePath("/espace/notifications");
  revalidatePath("/espace", "layout");
}
