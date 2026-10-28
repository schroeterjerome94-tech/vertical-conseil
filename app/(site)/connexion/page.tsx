import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <ConstructionNotice
      kicker="Espace client"
      title="Espace client en construction — Bientôt disponible"
    />
  );
}
