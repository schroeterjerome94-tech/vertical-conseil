import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Confirmez votre e-mail",
};

export default function ConfirmationPage() {
  return (
    <ConstructionNotice
      kicker="Inscription"
      title="Les inscriptions seront prochainement disponibles"
    />
  );
}
