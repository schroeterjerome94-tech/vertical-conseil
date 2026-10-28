import type { Metadata } from "next";
import { ConstructionNotice } from "@/components/ConstructionNotice";

export const metadata: Metadata = {
  title: "Compte en attente",
};

export default function PendingAccountPage() {
  return (
    <ConstructionNotice
      kicker="Espace client"
      title="Espace client en construction — Bientôt disponible"
    />
  );
}
