import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <main className="page-wrap flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <h1 className="text-3xl font-semibold text-navy">Nouveau mot de passe</h1>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
