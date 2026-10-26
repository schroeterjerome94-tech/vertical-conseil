import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/AuthForm";
import { ConstructionNotice } from "@/components/ConstructionNotice";
import { isPlatformOpen } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default function RegisterPage() {
  if (!isPlatformOpen()) {
    return (
      <ConstructionNotice kicker="Inscription" title="Créer un compte" />
    );
  }

  return (
    <main className="flex min-h-[calc(100svh-80px)] items-start justify-center px-6 pt-10 pb-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Inscription
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Créer un compte</h1>
        <p className="mt-2 text-[14px] leading-6 text-muted">
          Votre compte sera activé après validation par Vertical Conseil.
        </p>
        <RegisterForm />
        <p className="mt-4 text-center text-[13px] text-muted">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-semibold text-logo">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
