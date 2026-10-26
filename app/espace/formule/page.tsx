import Link from "next/link";
import { requestProAction } from "./actions";
import { AsceProTariffTable } from "@/components/AsceProTariffTable";
import { GeranceProTariffTable } from "@/components/GeranceProTariffTable";
import { ASCE_CDC_BASE_HT, ASCE_CDC_SURCHARGE_PCT } from "@/lib/asce-pro-pricing";
import { PRO_YEARLY_PERIOD, PRO_YEARLY_PRICE } from "@/lib/constants";
import { formatChf } from "@/lib/money";
import { getAccountPlan, isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

const GERANCE_FREE = [
  "Contrôle et audit de la première demande",
  "Accès à votre espace",
  "Informations générales",
  "Informations techniques existantes",
];
const GERANCE_PRO = [
  "Toutes les fonctionnalités gratuites",
  "Comparatif des offres",
  "Historique complet",
  "Photos",
  "Visites 360°",
  "Vidéos 360°",
  "Plans",
  "Dossier technique",
  "Documents et rapports",
];
const ASCE_FREE = [
  "Accès aux cahiers des charges (données existantes floutées)",
  "Consultation des projets",
  "Notifications des nouveaux projets",
  "Suivi des soumissions",
  "Accès à votre espace",
];
const ASCE_PRO = [
  "Toutes les fonctionnalités gratuites",
  "Données complètes du cahier des charges",
  "Photos, visites 360° et vidéos 360°",
  "Plans",
];

function Check({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.2 8.2 6.3 11.3 12.8 4.7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function FormulePage() {
  const { user } = await requireUser();
  if (user.role === "admin") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-navy">Formule</h1>
        <p className="mt-3 text-[15px] text-muted">
          Les comptes Vertical Conseil ont accès à l’ensemble des fonctions.
        </p>
      </div>
    );
  }

  const { plan, planRequested } = await getAccountPlan(user.id);
  const pro = isPro(user.role, plan);
  const isGerance = user.role === "gerance";
  const tone = isGerance ? "blue" : "green";
  const checkClass = tone === "blue" ? "text-brand" : "text-green";
  const plans = [
    {
      kind: "Version",
      name: "Gratuite",
      tagline: "Pour simplifier votre quotidien",
      items: isGerance ? GERANCE_FREE : ASCE_FREE,
      featured: false,
      current: isGerance ? !pro : true,
    },
    {
      kind: isGerance ? "Abonnement" : "Version",
      name: "Pro",
      tagline: isGerance
        ? "Pour bénéficier de tous les avantages"
        : "Pour accéder aux données du cahier des charges",
      items: isGerance ? GERANCE_PRO : ASCE_PRO,
      featured: true,
      current: isGerance && pro,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center md:min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
          Formule
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">
          {isGerance
            ? pro
              ? "Abonnement Pro"
              : "Version gratuite"
            : "Version Pro par cahier des charges"}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-6 text-muted">
          {pro
            ? "Votre compte bénéficie de tous les avantages Pro."
            : isGerance
              ? "Pour bénéficier de tous les avantages, demandez l’abonnement Pro. Vertical Conseil l’active ensuite."
              : `La version Pro donne accès aux données du cahier des charges. Ce n’est pas un abonnement : un tarif unique par cahier des charges, avec ${ASCE_CDC_SURCHARGE_PCT} % de plus à chaque installation supplémentaire à la même adresse. En confirmant sur un appel d’offres, l’accès s’ouvre immédiatement et une facture vous parvient par e-mail, payable à 30 jours.`}
        </p>
      </div>

      <article
        className={`mt-6 rounded-[22px] border p-3.5 sm:p-4 ${
          tone === "blue"
            ? "border-[#c5d4fb] bg-white"
            : "border-[#bfe8d4] bg-white"
        }`}
      >
        <div className="mb-3 flex items-center justify-center gap-3 text-center sm:text-left">
          <span className="size-11 shrink-0">
            <img
              src={
                isGerance
                  ? "/icons/formules/gerances.svg"
                  : "/icons/formules/ascensoristes.svg"
              }
              alt=""
              width={44}
              height={44}
              className="size-11 object-contain"
            />
          </span>
          <div>
            <h2 className="text-[20px] font-semibold leading-none tracking-tight text-navy">
              {isGerance ? "Gérances & Propriétaires" : "Ascensoristes"}
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              {isGerance
                ? "Gestion de votre parc d'ascenseurs"
                : "Accès aux appels d'offres"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:items-stretch">
          {plans.map((item) => (
            <section
              key={item.name}
              className={`flex h-full flex-col rounded-[16px] px-4 py-4 ${
                item.featured
                  ? tone === "blue"
                    ? "bg-[#eef3ff]"
                    : "bg-[#e8f8ee]"
                  : "border border-line bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {item.kind}
                  </p>
                  <h3 className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-navy">
                    {item.name}
                  </h3>
                </div>
                {item.current ? (
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      item.featured
                        ? "bg-white text-navy"
                        : "bg-soft text-muted"
                    }`}
                  >
                    Formule actuelle
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] text-muted">{item.tagline}</p>
              {item.featured ? (
                <p className="mt-3 text-[20px] font-semibold leading-none tracking-tight text-navy">
                  {isGerance
                    ? PRO_YEARLY_PRICE
                    : `${formatChf(ASCE_CDC_BASE_HT)} CHF HT`}
                  <span className="ml-1.5 text-[13px] font-medium text-muted">
                    {isGerance ? PRO_YEARLY_PERIOD : "par cahier des charges"}
                  </span>
                </p>
              ) : null}
              <ul className="mt-3 grid gap-1.5">
                {item.items.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-[13px] leading-5 text-navy"
                  >
                    <Check className={`mt-0.5 shrink-0 ${checkClass}`} />
                    {line}
                  </li>
                ))}
              </ul>
              {item.featured ? (
                <div className="mt-auto pt-4">
                  {isGerance && pro ? (
                    <p className="text-center text-[13px] font-semibold text-navy">
                      Abonnement Pro actif
                    </p>
                  ) : isGerance ? (
                    <form action={requestProAction}>
                      <button
                        type="submit"
                        disabled={planRequested}
                        className="flex h-11 w-full items-center justify-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white hover:bg-navy disabled:opacity-50"
                      >
                        {planRequested
                          ? "Demande envoyée"
                          : "Passer l’abonnement Pro"}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/espace/appels-doffres"
                      className="flex h-11 w-full items-center justify-center rounded-full bg-green px-5 text-[14px] font-semibold text-white hover:bg-[#067a48]"
                    >
                      Ouvrir un appel d’offres
                    </Link>
                  )}
                </div>
              ) : (
                <p className="mt-auto pt-4 text-center text-[13px] text-muted">
                  {item.current
                    ? "Incluse dans votre compte"
                    : isGerance
                      ? "Incluse dans l’abonnement Pro"
                      : "Incluse dans la version Pro"}
                </p>
              )}
            </section>
          ))}
        </div>
      </article>
      {isGerance ? <GeranceProTariffTable /> : <AsceProTariffTable />}
    </div>
  );
}
