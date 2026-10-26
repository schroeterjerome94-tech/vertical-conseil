import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/app/SignOutButton";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Compte en attente",
};


export default async function PendingAccountPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/connexion");
  if (current.user.status === "approved") redirect("/espace");

  const copy =
    current.user.status === "pending"
      ? "Votre compte est en attente de validation par Vertical Conseil."
      : current.user.status === "refused"
        ? "Cette inscription n’a pas été acceptée. Contactez-nous si besoin."
        : "Ce compte a été suspendu.";

  return (
    <main className="page-wrap flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md rounded-[28px] border border-line bg-white p-8">
        <h1 className="text-3xl font-semibold text-navy">Accès non activé</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">{copy}</p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
