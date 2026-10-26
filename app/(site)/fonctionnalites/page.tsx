import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Fonctionnalités",
};

export default function FeaturesPage() {
  return <HashRedirect hash="#fonctionnalites" />;
}
