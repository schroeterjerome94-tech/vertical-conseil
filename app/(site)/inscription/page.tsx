import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <ConstructionNotice
      kicker="Inscription"
      title="Les inscriptions seront prochainement disponibles"
    />
  );
}
