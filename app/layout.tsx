import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Vertical Conseil",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ascenseur",
    "audit ascenseur",
    "modernisation ascenseur",
    "contrat d’entretien ascenseur",
    "régie immobilière",
    "Suisse romande",
    "Vertical Conseil",
  ],
  authors: [{ name: "Vertical Conseil Sàrl" }],
  creator: "Vertical Conseil Sàrl",
  publisher: "Vertical Conseil Sàrl",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: SITE_URL,
    siteName: "Vertical Conseil",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/brand/logo-transparent.png",
        alt: "Vertical Conseil — Expert indépendant en ascenseurs",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/brand/logo-transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr-CH"
      className={`${outfit.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-[#f7f9fc] text-navy">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
