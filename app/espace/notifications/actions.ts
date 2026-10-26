"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { markNoticeRead } from "@/lib/notices";
import { requireUser } from "@/lib/session";

function safePath(href: string) {
  if (href.startsWith("/")) return href;
  try {
    return new URL(href).pathname + new URL(href).search;
  } catch {
    return "/espace/notifications";
  }
}

export async function openNoticeAction(id: string, href: string) {
  const { user } = await requireUser();
  await markNoticeRead(user.id, id);
  revalidatePath("/espace/notifications");
  redirect(safePath(href));
}
