import Link from "next/link";
import { InstallationSurchargeTable } from "@/components/InstallationSurchargeTable";
import { formatChf } from "@/lib/money";
import {
  GERANCE_AO_BASE_HT,
  INSTALLATION_SURCHARGE_PCT,
} from "@/lib/installation-surcharge";
import { requireGerance } from "@/lib/session";

const CONDITIONS = [
  "En cochant la case lors de l’envoi d’une demande, vous confirmez avoir pris connaissance des tarifs et conditions de cette page.",
  "Les prestations de Vertical Conseil donnent lieu à des honoraires, facturés selon les tarifs indiqués ci-dessous.",
  "Les tarifs s’entendent hors TVA 8,1 %, sauf indication contraire.",
  "Vertical Conseil reste indépendant des fabricants et des installateurs.",
];

const TARIFS = [
  {
    title: "Audit",
    detail: "Visite, contrôle de l’installation et rapport d’audit.",
    prices: [{ amount: "Communiqué avant engagement" }],
  },
  {
    title: "Réparation",
    detail: "Analyse du besoin, orientation et, si nécessaire, suivi de l’intervention.",
    prices: [{ amount: "Communiqué avant engagement" }],
  },
  {
    title: "Question",
    detail: "Selon la nature de la demande, des honoraires peuvent s’appliquer.",
    prices: [{ amount: "Selon la demande" }],
  },
];

function demandeReturnPath(value?: string) {
  if (!value) return null;
  if (!value.startsWith("/espace/demandes/nouvelle")) return null;
  if (value.startsWith("//") || value.includes("://")) return null;
  return value;
}

export default async function TarifsPage({
  searchParams,
}: {
  searchParams: Promise<{ retour?: string }>;
}) {
  await requireGerance();
  const { retour } = await searchParams;
  const backToDemande = demandeReturnPath(retour);

  return (
    <div className="max-w-3xl">
      {backToDemande ? (
        <Link
          href={backToDemande}
          className="mb-6 inline-flex text-[14px] font-semibold text-logo"
        >
          Retour à la demande
        </Link>
      ) : null}
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
        Prestations
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">
        Tarifs et conditions
      </h1>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        Honoraires facturés par Vertical Conseil pour les demandes transmises
        depuis votre espace.
      </p>

      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Conditions</h2>
        <ul className="mt-4 grid gap-3 text-[15px] leading-7 text-navy">
          {CONDITIONS.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <InstallationSurchargeTable
        title="Appel d’offres"
        baseHt={GERANCE_AO_BASE_HT}
        intro={
          <p>
            Visite et relevé, cahier des charges, lancement et suivi de
            l’appel d’offres jusqu’au choix. {formatChf(GERANCE_AO_BASE_HT)} CHF
            HT pour une installation, puis {INSTALLATION_SURCHARGE_PCT} % de plus
            à chaque installation supplémentaire à la même adresse. Hors TVA
            8,1 %.
          </p>
        }
      />

      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-navy">Autres prestations</h2>
        </div>
        <div className="divide-y divide-line">
          {TARIFS.map((item) => (
            <div
              key={item.title}
              className="grid gap-2 px-6 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] sm:items-start"
            >
              <p className="font-semibold text-navy">{item.title}</p>
              <p className="text-[14px] leading-6 text-muted">{item.detail}</p>
              <div className="grid gap-2 sm:text-right">
                {item.prices.map((price) => (
                  <p key={`${item.title}-${price.amount}`}>
                    {price.label ? (
                      <span className="block text-[12px] font-medium text-muted">
                        {price.label}
                      </span>
                    ) : null}
                    <span className="text-[14px] font-semibold text-navy">
                      {price.amount}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {backToDemande ? (
        <Link
          href={backToDemande}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white"
        >
          Retour à la demande
        </Link>
      ) : null}
    </div>
  );
}
