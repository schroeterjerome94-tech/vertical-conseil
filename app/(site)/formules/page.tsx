import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Formules",
};

export default function PricingPage() {
  return <HashRedirect hash="#formules" />;
}
