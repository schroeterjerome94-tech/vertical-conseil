import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";

export default async function AdminPlansRedirectPage() {
  await requireAdmin();
  redirect("/espace/admin/inscriptions");
}
