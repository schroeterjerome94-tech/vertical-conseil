import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { getAdminNavCounts } from "@/lib/admin-nav";
import { isPlatformOpen } from "@/lib/platform";
import { requireUser } from "@/lib/session";

export default async function EspaceLayout({
  children,
}: LayoutProps<"/espace">) {
  if (!isPlatformOpen()) redirect("/connexion");
  const { user } = await requireUser();
  const badges =
    user.role === "admin" ? await getAdminNavCounts() : undefined;

  return (
    <AppShell
      role={user.role}
      name={
        user.role === "admin"
          ? user.name
          : user.organizationName?.trim() || user.name
      }
      badges={badges}
    >
      {children}
    </AppShell>
  );
}
