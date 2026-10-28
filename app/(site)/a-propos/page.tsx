import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Vertical Conseil : plus de 35 ans d’expérience dans l’ascenseur. Accompagnement indépendant des régies, propriétaires et professionnels en Suisse romande.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return <HashRedirect hash="#a-propos" />;
}
