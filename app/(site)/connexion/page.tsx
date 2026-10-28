import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <ConstructionNotice
      kicker="Espace client"
      title="Espace client en construction — Bientôt disponible"
    />
  );
}
