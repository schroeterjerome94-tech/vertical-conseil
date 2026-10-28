import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/connexion",
        "/inscription",
        "/inscription/confirmation",
        "/compte-en-attente",
        "/mot-de-passe-oublie",
        "/reinitialiser-mot-de-passe",
        "/espace",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
