import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <main className="page-wrap flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <h1 className="text-3xl font-semibold text-navy">Mot de passe oublié</h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Indiquez votre e-mail. En local, le lien apparaît ensuite sur la page
          de confirmation.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-[14px]">
          <Link href="/connexion" className="font-semibold text-logo">
            Retour
          </Link>
        </p>
      </div>
    </main>
  );
}
