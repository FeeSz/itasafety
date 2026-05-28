import { Link, createFileRoute } from "@tanstack/react-router";
import HeroIndustrial from "@/components/sections/HeroIndustrial";
import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Differentials from "@/components/sections/Differentials";
import Certifications from "@/components/sections/Certifications";
import PartnersStrip from "@/components/sections/PartnersStrip";
import CommercialCTA from "@/components/sections/CommercialCTA";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ItaSafety — Proteção Industrial que Não Negocia" },
      {
        name: "description",
        content:
          "Distribuidora enterprise de EPIs para indústrias brasileiras. Capacetes, respiradores, cinturões, luvas, calçados e consultoria técnica em conformidade com as NRs.",
      },
      { property: "og:title", content: "ItaSafety — Proteção Industrial que Não Negocia" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <HeroIndustrial />

      <PartnersStrip />

      {/* CATEGORIES */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <Container>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Especialidades</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-5xl">
                Categorias de Proteção
              </h2>
              <p className="mt-4 max-w-xl text-ink-muted">
                Catálogo segmentado por norma regulamentadora e função
                operacional — da proteção da cabeça à dermatológica.
              </p>
            </div>
            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-navy hover:text-brand-red"
            >
              Ver catálogo completo →
            </Link>
          </div>
          <CategoryGrid />
        </Container>
      </section>

      <Differentials />

      {/* PRODUCTS */}
      <section className="border-t border-hairline bg-white py-24 md:py-32">
        <Container>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Destaques</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-5xl">
                Catálogo em Foco
              </h2>
              <p className="mt-4 max-w-xl text-ink-muted">
                Equipamentos mais especificados pela nossa engenharia de
                aplicação nos últimos 90 dias.
              </p>
            </div>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-navy hover:text-brand-red"
            >
              Cotar lista completa →
            </Link>
          </div>
          <FeaturedProducts />
        </Container>
      </section>

      <Certifications />

      <CommercialCTA />
    </>
  );
}
