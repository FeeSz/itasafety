import { createFileRoute, Link } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";
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
      <section className="bg-surface-sunken py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <article
                key={cat.slug}
                className="group border-t-4 border-brand-red bg-brand-navy-deep p-8 transition-transform hover:-translate-y-1"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {cat.code}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-red">
                    {cat.normas}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
                  {cat.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{cat.description}</p>
                <Link
                  to="/contato"
                  className="mt-8 inline-block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:text-brand-red"
                >
                  Solicitar Cotação →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
