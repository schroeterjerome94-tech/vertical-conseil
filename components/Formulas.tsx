import Link from "next/link";

const formulas = [
  {
    audience: "Gérances & Propriétaires",
    subtitle: "Gestion de votre parc d'ascenseurs",
    iconSrc: "/icons/formules/gerances.svg",
    tone: "blue" as const,
    plans: [
      {
        kind: "Version",
        name: "Gratuite",
        tagline: "Pour simplifier votre quotidien",
        items: [
          "Contrôle et audit de la première demande",
          "Accès à votre espace",
          "Documents",
          "Informations principales",
        ],
        action: "Créer un compte gratuitement",
        href: "/inscription",
        featured: false,
      },
      {
        kind: "Abonnement",
        name: "Pro",
        tagline: "Pour bénéficier de tous les avantages",
        items: [
          "Toutes les fonctionnalités gratuites",
          "Comparatif des offres",
          "Historique complet",
          "Dossier technique",
          "Rapports",
          "Photos",
          "Plans",
        ],
        action: "Passer l'abonnement Pro",
        href: "/#contact",
        featured: true,
      },
    ],
  },
  {
    audience: "Ascensoristes",
    subtitle: "Accès aux appels d'offres",
    iconSrc: "/icons/formules/ascensoristes.svg",
    tone: "green" as const,
    plans: [
      {
        kind: "Version",
        name: "Gratuite",
        tagline: "Pour simplifier votre quotidien",
        items: [
          "Accès aux cahiers des charges",
          "Consultation des projets",
          "Notifications des nouveaux projets",
          "Suivi des soumissions",
          "Accès à votre espace",
        ],
        action: "Créer un compte gratuitement",
        href: "/inscription",
        featured: false,
      },
      {
        kind: "Version",
        name: "Pro",
        tagline: "Pour bénéficier de tous les avantages",
        items: [
          "Toutes les fonctionnalités gratuites",
          "Consultation des plans détaillés",
          "Accès aux photos et aux visites 360°",
          "Suivi des soumissions détaillées",
          "Historique de vos offres en ligne",
          "Alertes avant les échéances",
        ],
        action: "Passer à la version Pro",
        href: "/#contact",
        featured: true,
      },
    ],
  },
];

function Check({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
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

export function Formulas() {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-2">
      {formulas.map((formula) => {
        const isBlue = formula.tone === "blue";
        return (
          <article
            key={formula.audience}
            className={`flex h-full flex-col rounded-[22px] border p-3.5 sm:p-4 ${
              isBlue
                ? "border-[#c5d4fb] bg-white"
                : "border-[#bfe8d4] bg-white"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  aspectRatio: "1 / 1",
                }}
              >
                <img
                  src={formula.iconSrc}
                  alt=""
                  width={48}
                  height={48}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    aspectRatio: "1 / 1",
                    display: "block",
                  }}
                />
              </span>
              <div>
                <h3 className="text-[22px] font-semibold leading-none tracking-tight text-navy">
                  {formula.audience}
                </h3>
                <p className="mt-1 text-[12px] leading-4 text-muted">
                  {formula.subtitle}
                </p>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-2 sm:items-stretch">
              {formula.plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex h-full flex-col rounded-[16px] px-3.5 py-3.5 ${
                    plan.featured
                      ? isBlue
                        ? "bg-[#eef3ff]"
                        : "bg-[#e8f8ee]"
                      : "bg-white"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {plan.kind}
                  </p>
                  <p className="mt-0.5 text-[22px] font-semibold leading-none tracking-tight text-navy">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-[12px] leading-4 text-muted">
                    {plan.tagline}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-1.5 text-[12.5px] leading-[18px] text-navy"
                      >
                        <Check
                          className={`mt-0.5 shrink-0 ${
                            isBlue ? "text-brand" : "text-green"
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-3">
                    <Link
                      href={plan.href}
                      className={`mx-auto flex h-11 w-[82%] items-center justify-center rounded-full px-3 text-center text-[14px] font-semibold leading-tight text-white transition ${
                        isBlue
                          ? "bg-logo hover:bg-navy"
                          : "bg-green hover:bg-[#067a48]"
                      }`}
                    >
                      {plan.action}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
