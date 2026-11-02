import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/seo";

export function JsonLd() {
  const organizationId = `${SITE_URL}/#organisation`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": organizationId,
        name: "Vertical Conseil Sàrl",
        alternateName: "Vertical Conseil",
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
        image: `${SITE_URL}/brand/logo-transparent.png`,
        description: SITE_DESCRIPTION,
        email: "info@vertical-conseil.ch",
        availableLanguage: "fr-CH",
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Suisse romande",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rue du Molage 10b",
          addressLocality: "Aigle",
          postalCode: "1860",
          addressRegion: "VD",
          addressCountry: "CH",
        },
        knowsAbout: [
          "Conseil indépendant en ascenseurs",
          "Audit et analyse des risques",
          "Contrôle de devis",
          "Contrats d’entretien",
          "Modernisation et remplacement d’ascenseurs",
          "Gestion de parc d’ascenseurs",
          "Appels d’offres ascenseurs",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Prestations Vertical Conseil",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Audit & analyse des risques",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Réparations & devis",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Modernisation & remplacement",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Contrats & maintenance",
              },
            },
          ],
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#plateforme`,
        name: "Plateforme Vertical Conseil",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "fr-CH",
        provider: { "@id": organizationId },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CHF",
          description: "Version gratuite, avec formule Pro.",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: "Vertical Conseil",
        alternateName: SITE_TITLE,
        url: SITE_URL,
        inLanguage: "fr-CH",
        publisher: { "@id": organizationId },
      },
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
