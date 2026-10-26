import Link from "next/link";

export function ConstructionNotice({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <main className="flex min-h-[calc(100svh-80px)] items-start justify-center px-6 pt-10 pb-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(7,29,68,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          {kicker}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">{title}</h1>
        <p className="mt-3 text-[14px] leading-6 text-muted">
          L’espace client est en construction. La plateforme sera bientôt
          disponible. Pour toute question, écrivez-nous via le formulaire de
          contact.
        </p>
        <Link
          href="/#contact"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-logo px-6 text-[15px] font-semibold text-white transition hover:bg-navy"
        >
          Nous contacter
        </Link>
      </div>
    </main>
  );
}
