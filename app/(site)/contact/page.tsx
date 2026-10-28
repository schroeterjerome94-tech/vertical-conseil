import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Vertical Conseil à Aigle pour un audit, une modernisation ou l’optimisation d’un contrat d’entretien d’ascenseur en Suisse romande.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <HashRedirect hash="#contact" />;
}
