import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Catálogo de Categorias — ItaSafety" },
      {
        name: "description",
        content:
          "Doze categorias completas de EPI: proteção da cabeça, visual, auditiva, respiratória, trabalho em altura, luvas, calçados, vestimentas e mais.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Catálogo Técnico"
        title="Categorias de Proteção Industrial"
        description="Portfólio estruturado por classe de risco, com itens certificados pelo Ministério do Trabalho e validados por nossa engenharia de aplicação."
      />
      <section className="bg-white py-20 md:py-28">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <article
                  key={cat.slug}
                  className="group relative flex flex-col gap-6 overflow-hidden rounded-md border border-hairline bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-sm bg-brand-navy/5 text-brand-navy transition-colors group-hover:bg-brand-red group-hover:text-white">
                      <Icon className="size-7" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                      {cat.code}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
                      {cat.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-hairline pt-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-navy">
                      {cat.normas}
                    </span>
                    <Link
                      to="/contato"
                      className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-brand-red"
                    >
                      Cotar
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
