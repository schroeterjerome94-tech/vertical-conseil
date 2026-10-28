import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <ConstructionNotice
      kicker="Espace client"
      title="Espace client en construction — Bientôt disponible"
    />
  );
}
