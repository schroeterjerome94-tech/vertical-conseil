import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Vertical Conseil Sàrl",
    alternateName: "Vertical Conseil",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    image: `${SITE_URL}/brand/logo-transparent.png`,
    description: SITE_DESCRIPTION,
    email: "info@vertical-conseil.ch",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Suisse romande",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rue du Molage 10b",
      addressLocality: "Aigle",
      postalCode: "1860",
      addressCountry: "CH",
    },
    knowsAbout: [
      "Ascenseurs",
      "Audit d’installations",
      "Modernisation d’ascenseurs",
      "Contrats d’entretien",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
