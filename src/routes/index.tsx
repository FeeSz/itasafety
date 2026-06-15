import { createFileRoute, Link } from "@tanstack/react-router";
import HeroSlider from "@/components/sections/HeroSlider";
import CategoryPills from "@/components/sections/CategoryPills";

import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import WhatsAppBanner from "@/components/sections/WhatsAppBanner";
import IntermediateBanners from "@/components/sections/IntermediateBanners";
import PartnersStrip from "@/components/sections/PartnersStrip";
import Differentials from "@/components/sections/Differentials";
import Certifications from "@/components/sections/Certifications";
import TrustSignals from "@/components/sections/TrustSignals";
import CommercialCTA from "@/components/sections/CommercialCTA";
import Reveal from "@/components/ui/Reveal";
import { pageMeta, SITE_URL } from "@/lib/seo";

const HOME_DESC =
  "Distribuidora de EPIs com produtos certificados pelo MTE. Calçados, luvas, capacetes, proteção visual, respiratória e auditiva para empresas de todo o Brasil.";

export const Route = createFileRoute("/")({
  head: () => {
    const base = pageMeta({
      title: "ItaSafety — Equipamentos de Proteção Individual (EPI)",
      description: HOME_DESC,
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
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+55-11-2626-7417",
                  contactType: "sales",
                  areaServed: "BR",
                  availableLanguage: "Portuguese",
                },
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
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryPills />

      {/* Trust signals first — establish confiança */}
      <Reveal>
        <TrustSignals />
      </Reveal>

      {/* Categorias */}
      <section className="bg-white py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-ink md:text-3xl">
                  Navegue por Categoria
                </h2>
                <span className="mt-2 block h-[3px] w-10 bg-brand-blue" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <CategoryGrid />
          </Reveal>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="bg-surface-sunken py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-ink md:text-3xl">
                  Produtos em Destaque
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  Seleção dos mais procurados com Certificado de Aprovação.
                </p>
              </div>
              <Link
                to="/departamento/$slug"
                params={{ slug: "calcados" }}
                className="text-sm font-bold text-brand-blue hover:text-brand-blue-hover"
              >
                Ver todos →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <FeaturedProducts />
          </Reveal>
        </div>
      </section>

      <Reveal>
        <WhatsAppBanner />
      </Reveal>

      <Reveal>
        <IntermediateBanners />
      </Reveal>

      <Reveal>
        <PartnersStrip />
      </Reveal>

      <Reveal>
        <Differentials />
      </Reveal>

      <Reveal>
        <Certifications />
      </Reveal>

      <Reveal>
        <CommercialCTA />
      </Reveal>
    </>
  );
}
