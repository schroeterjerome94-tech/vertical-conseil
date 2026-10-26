import type { Metadata } from "next";
import { HashRedirect } from "@/components/HashRedirect";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return <HashRedirect hash="#contact" />;
}
