import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Formules",
  description:
    "Formules Vertical Conseil pour gérances, propriétaires et ascensoristes. Version gratuite et abonnement Pro, sans frais cachés.",
  alternates: { canonical: "/formules" },
};

export default function PricingPage() {
  return <HashRedirect hash="#formules" />;
}
