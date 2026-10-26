import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/AuthForm";
import { ConstructionNotice } from "@/components/ConstructionNotice";
import { isPlatformOpen } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  if (!isPlatformOpen()) {
    return <ConstructionNotice kicker="Espace client" title="Se connecter" />;
  }

  return (
    <main className="flex min-h-[calc(100svh-80px)] items-start justify-center px-6 pt-10 pb-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Espace client
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Se connecter</h1>
        <p className="mt-2 text-[14px] leading-6 text-muted">
          Accédez à votre espace gérance, ascensoriste ou administration.
        </p>
        <LoginForm />
        <p className="mt-4 text-center text-[13px] text-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-logo">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
