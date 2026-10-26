import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "À propos",
};

export default function AboutPage() {
  return <HashRedirect hash="#a-propos" />;
}
