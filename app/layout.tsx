import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Vertical Conseil",
    template: "%s | Vertical Conseil",
  },
  description:
    "La plateforme indépendante de gestion et d’appels d’offres pour ascenseurs en Suisse.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-[#f7f9fc] text-navy">
        {children}
      </body>
    </html>
  );
}
