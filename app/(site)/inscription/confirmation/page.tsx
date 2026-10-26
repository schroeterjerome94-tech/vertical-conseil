import type { Metadata } from "next";
import Link from "next/link";
import { ConstructionNotice } from "@/components/ConstructionNotice";
import { readDevMail } from "@/lib/dev-mailbox";
import { isPlatformOpen } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Confirmez votre e-mail",
};

export default function ConfirmationPage() {
  if (!isPlatformOpen()) {
    return (
      <ConstructionNotice
        kicker="Inscription"
        title="Les inscriptions seront prochainement disponibles"
      />
    );
  }

  const mail = readDevMail();

  return (
    <main className="page-wrap flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Inscription
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-navy">
          Confirmez votre e-mail
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Un lien de confirmation a été généré. En local, l’envoi d’e-mail réel
          n’est pas encore branché : utilisez le lien ci-dessous.
        </p>
        {mail ? (
          <a
            href={mail.url}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
          >
            Confirmer l’adresse {mail.to}
          </a>
        ) : (
          <p className="mt-6 text-[14px] text-muted">
            Aucun lien trouvé. Réessayez l’inscription.
          </p>
        )}
        <p className="mt-6 text-center text-[14px] text-muted">
          <Link href="/connexion" className="font-semibold text-logo">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
