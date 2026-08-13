import { createFileRoute } from "@tanstack/react-router";
import EntryLanding from "@/components/landing/EntryLanding";
import { pageMeta, SITE_URL } from "@/lib/seo";

const LANDING_DESCRIPTION =
  "Conheça a ItaSafety, explore soluções em equipamentos de proteção individual e organize uma solicitação de cotação para sua empresa.";

export const Route = createFileRoute("/")({
  head: () => {
    const base = pageMeta({
      title: "ItaSafety | Proteção individual para empresas",
      description: LANDING_DESCRIPTION,
      path: "/",
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "ItaSafety",
                url: SITE_URL,
                logo: `${SITE_URL}/favicon-mark.png`,
              },
              {
                "@type": "WebSite",
                name: "ItaSafety",
                url: SITE_URL,
              },
            ],
          }),
        },
      ],
    };
  },
  component: EntryLanding,
});
