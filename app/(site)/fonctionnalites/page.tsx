import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Fonctionnalités",
  description:
    "Historique, dossier technique, appels d’offres et offres comparables : la plateforme indépendante Vertical Conseil pour la gestion des ascenseurs.",
  alternates: { canonical: "/fonctionnalites" },
};

export default function FeaturesPage() {
  return <HashRedirect hash="#fonctionnalites" />;
}
