import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <ConstructionNotice
      kicker="Espace client"
      title="Espace client en construction — Bientôt disponible"
    />
  );
}
