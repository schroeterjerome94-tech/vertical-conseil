import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { ContactForm } from "@/components/ContactForm";
import { ContactPeople } from "@/components/ContactPeople";
import { HashLink } from "@/components/HashLink";
import { Reveal } from "@/components/Reveal";
import { CtaBanner } from "@/components/CtaBanner";
import { Formulas } from "@/components/Formulas";
import { PlatformPreview } from "@/components/PlatformPreview";
import {
  IconCamera,
  IconFolder,
  IconLock,
  IconScale,
  IconShield,
  IconShieldCheck,
  IconUsers,
} from "@/components/icons";
export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Historique complet",
    text: "Archives, plans, rapports et interventions réunis dans un dossier unique.",
    icon: IconFolder,
  },
  {
    title: "Dossier technique",
    text: "Relevés, photos et plans mis à jour au fil de la vie de l’installation.",
    icon: IconCamera,
  },
  {
    title: "Appels d’offres",
    text: "Consultez plusieurs ascensoristes qualifiés, sans perdre le fil.",
    icon: IconUsers,
  },
  {
    title: "Offres comparables",
    text: "Comparez les soumissions sur une base claire, neutre et lisible.",
    icon: IconScale,
  },
  {
    title: "Conformité aux normes",
    text: "Nous intégrons les normes et prescriptions applicables aux ascenseurs dans nos analyses, nos audits et nos cahiers des charges.",
    icon: IconShieldCheck,
  },
  {
    title: "Indépendant",
    text: "Une plateforme suisse, neutre vis-à-vis des fabricants et des installateurs.",
    icon: IconShield,
  },
  {
    title: "Sécurisé",
    text: "Comptes, documents et échanges pensés pour rester confidentiels.",
    icon: IconLock,
  },
];

const prestations: { title: string; text: string; titleClass?: string }[] = [
  {
    title: "Audit & analyse des risques",
    text: "Évaluation indépendante de vos installations, identification des risques liés à la sécurité et à la conformité, avec un rapport détaillé et des recommandations adaptées.",
  },
  {
    title: "Réparations & devis",
    text: "Expertise des travaux proposés, vérification des devis et recherche de solutions techniques et économiques, avec une mise en concurrence des prestataires.",
  },
  {
    title: "Modernisation & remplacement",
    titleClass: "whitespace-nowrap",
    text: "Élaboration de cahiers des charges, consultation de plusieurs entreprises, comparaison objective des offres et accompagnement jusqu’à la réalisation des travaux.",
  },
  {
    title: "Contrats & maintenance",
    text: "Analyse et optimisation des contrats d’entretien, mise en concurrence des prestataires, contrôle des coûts et suivi de la qualité des prestations.",
  },
];

const values = [
  {
    title: "Expérience",
    text: "Plus de 35 ans d’expérience cumulée dans l’ascenseur.",
    icon: "/icons/values/experience.svg",
  },
  {
    title: "Transparence",
    text: "Des informations claires, accessibles et à jour.",
    icon: "/icons/values/transparence.png",
  },
  {
    title: "Sécurité",
    text: "Des données hébergées en Suisse et protégées.",
    icon: "/icons/values/securite.png",
  },
  {
    title: "Efficacité",
    text: "Des outils pensés pour gagner du temps au quotidien.",
    icon: "/icons/values/efficacite.png",
  },
  {
    title: "Accompagnement",
    text: "Une équipe à votre écoute à chaque étape.",
    icon: "/icons/values/accompagnement.svg",
  },
];

export default function HomePage() {
  return (
    <main>
      <section id="accueil" className="overflow-hidden bg-black">
        <div className="grid min-h-[72vh] lg:grid-cols-2">
          <div className="relative z-10 order-2 flex items-center bg-black px-6 py-14 sm:px-10 lg:order-1 lg:px-16 lg:py-20 min-[1920px]:px-24 min-[2560px]:px-32">
            <div className="max-w-xl min-[1920px]:max-w-2xl min-[2560px]:max-w-3xl">
              <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[48px]">
                La plateforme indépendante de gestion et d’appels d’offres{" "}
                <span className="text-brand">pour ascenseurs</span>
              </h1>
              <p className="mt-6 max-w-lg text-[17px] leading-8 text-white/85">
                Centralisez vos installations, consultez l’historique complet et
                obtenez des offres comparables en toute transparence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/connexion"
                  className="inline-flex h-12 items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white transition hover:bg-brand"
                >
                  Projets disponibles →
                </Link>
                <HashLink
                  href="/#fonctionnalites"
                  className="inline-flex h-12 items-center rounded-full border border-white/55 px-7 text-[15px] font-semibold text-white transition hover:bg-white/10"
                >
                  Fonctionnalités →
                </HashLink>
              </div>
            </div>
          </div>
          <div className="relative order-1 min-h-[46vh] bg-black lg:order-2 lg:min-h-[72vh]">
            <Image
              src="/photos/hero-hall-moderne.jpg"
              alt="Hall moderne avec ascenseur ouvert"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-black to-transparent lg:block" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent lg:hidden" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="site-bar px-8 py-10 sm:px-10 lg:px-14 xl:px-16 min-[1920px]:px-0">
          <Reveal>
            <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {prestations.map((item) => (
                <article
                  key={item.title}
                  className="flex h-full flex-col rounded-[28px] bg-soft px-5 py-6"
                >
                  <h2
                    className={`text-[18px] font-semibold tracking-tight text-navy ${
                      item.titleClass ?? ""
                    }`}
                  >
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[13px] leading-6 text-muted">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="a-propos" className="bg-white">
        <div className="page-wrap flex min-h-[calc(100svh-5rem)] flex-col justify-center py-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
                À propos de Vertical Conseil
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
                Une approche sur la gestion{" "}
                <span className="text-brand">des ascenseurs</span>
              </h2>
              <div className="mt-5 space-y-4 text-[16px] leading-8 text-muted">
                <p>
                  Vertical Conseil accompagne les régies, les propriétaires et
                  les professionnels de l’ascenseur dans la gestion et la
                  modernisation de leurs installations.
                </p>
                <p>
                  Forts de plus de 35 ans d’expérience cumulée dans le domaine
                  de l’ascenseur, nous avons développé une plateforme
                  indépendante qui simplifie la gestion des installations et
                  les appels d’offres.
                </p>
                <p>
                  Notre objectif : centraliser les informations, faciliter les
                  démarches et apporter davantage de transparence à chaque
                  étape de vos projets.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="relative min-h-[260px] overflow-hidden rounded-[28px] sm:min-h-[340px] lg:min-h-[380px]">
                <Image
                  src="/photos/cage-ascenseur-alt.jpg"
                  alt="Cage d’ascenseur vitrée"
                  fill
                  unoptimized
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="page-wrap pb-4 pt-10">
          <Reveal>
            <h3 className="text-center text-2xl font-semibold tracking-tight text-navy sm:text-[28px]">
              Nos valeurs
            </h3>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {values.map((value) => (
                <article
                  key={value.title}
                  className="rounded-2xl border border-line bg-white px-5 py-5 shadow-[0_8px_24px_rgba(7,29,68,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center">
                      <Image
                        src={value.icon}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 object-contain"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="font-semibold text-navy">{value.title}</p>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-muted">
                    {value.text}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="mt-14 pb-16">
          <CtaBanner
            className="page-wrap"
            title="Une question ? Parlons-en."
            subtitle="Notre équipe est à votre disposition pour répondre à vos questions."
            href="/#contact"
            action="Nous contacter →"
          />
        </div>
      </section>

      <section id="fonctionnalites" className="section-pad">
        <div className="page-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
              Une plateforme, toutes les solutions
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-muted">
              Une vue claire de votre patrimoine : historique, documents,
              photos, plans, interventions et rapports. Accessible en quelques
              clics.
            </p>
          </Reveal>
          <Reveal className="mt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`rounded-2xl border border-line bg-white px-5 py-5 shadow-[0_8px_24px_rgba(7,29,68,0.04)] ${
                    index < 4 ? "lg:col-span-3" : "lg:col-span-4"
                  } ${
                    index === 6
                      ? "sm:max-lg:col-span-2 sm:max-lg:mx-auto sm:max-lg:w-full sm:max-lg:max-w-[calc(50%-0.5rem)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-brand">
                      <feature.icon size={28} />
                    </span>
                    <h3 className="font-semibold text-navy">{feature.title}</h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-muted">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="gerance" className="section-pad bg-white">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
              Gérances & propriétaires
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
              Votre parc d’ascenseurs.
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-muted">
              Suivez l’état de chaque installation, anticipez les
              modernisations et lancez vos projets sans disperser les dossiers.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                {
                  title: "Dossier technique à jour",
                  text: "Plans, contrats, rapports et documents centralisés.",
                },
                {
                  title: "Photos et plans centralisés",
                  text: "Relevés photographiques et plans par installation.",
                },
                {
                  title: "Rapports et audits",
                  text: "Contrôles, expertises et audits techniques.",
                },
                {
                  title: "Suivi et anticipation",
                  text: "Identifiez les installations à moderniser ou à remplacer.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="mt-0.5 text-[14px] leading-6 text-muted">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <PlatformPreview kind="gerance" />
          </Reveal>
        </div>
        <div className="mt-14">
          <CtaBanner
            className="page-wrap"
            title="Vous souhaitez en savoir plus sur la gestion de votre parc ?"
            href="/#contact"
            action="Nous contacter →"
          />
        </div>
      </section>

      <section id="ascensoristes" className="section-pad bg-white">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal delay={100} className="order-2 lg:order-1">
            <PlatformPreview kind="ascensoriste" />
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
              Ascensoristes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
              Accédez aux projets, répondez simplement.
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-muted">
              Consultez les cahiers des charges, les relevés et les plans, puis
              déposez vos offres en ligne. Suivez l’état de vos soumissions sans
              relances inutiles.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "Cahiers des charges détaillés",
                "Relevés, photos et dimensions",
                "Suivi des soumissions en temps réel",
                "Espace dédié à votre entreprise",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <p className="font-semibold text-navy">{item}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="mt-14">
          <CtaBanner
            className="page-wrap"
            title="Vous souhaitez en savoir plus sur l’accès aux projets ?"
            href="/#contact"
            action="Nous contacter →"
          />
        </div>
      </section>

      <section id="formules" className="py-12 lg:py-14">
          <div className="formulas-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
              Nos formules
            </p>
            <h2 className="mt-1.5 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
              Des solutions adaptées à vos besoins
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-muted">
              Aucun frais caché. Choisissez la formule qui vous convient.
            </p>
          </Reveal>
          <Reveal className="mt-5">
            <Formulas />
          </Reveal>
        </div>
      </section>

      <section id="contact" className="bg-white">
        <div className="page-wrap flex min-h-[calc(100svh-5rem)] flex-col justify-center py-10">
          <div className="grid w-full -translate-y-8 items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
                Contactez-nous
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-[40px] sm:leading-[1.15]">
                Nous sommes à votre écoute.
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-muted">
                Une question, un projet ou besoin d’informations ? Notre équipe
                vous répond rapidement.
              </p>
              <ContactPeople />
            </Reveal>
            <Reveal delay={80}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
