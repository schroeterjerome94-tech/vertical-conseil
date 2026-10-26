"use server";

import { revalidatePath } from "next/cache";
import { deleteClientRequest } from "@/lib/requests";
import { requireAdmin } from "@/lib/session";

export async function deleteRequest(id: string) {
  await requireAdmin();
  await deleteClientRequest(id);
  revalidatePath("/espace/admin/demandes");
  revalidatePath("/espace/demandes");
  revalidatePath("/espace");
  revalidatePath("/espace", "layout");
}
