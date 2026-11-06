import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteIntro } from "@/components/SiteIntro";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteIntro />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
