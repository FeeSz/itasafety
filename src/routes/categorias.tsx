import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/categorias")({
  head: () =>
    pageMeta({
      title: "Categorias de EPI — ItaSafety",
      description:
        "Navegue pelo catálogo completo de EPIs ItaSafety: calçados, luvas, capacetes, proteção visual, respiratória, auditiva e mais.",
      path: "/categorias",
    }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-ink">Todas as Categorias</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Navegue pelo catálogo completo de EPIs certificados.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              to="/departamento/$slug"
              params={{ slug: cat.slug }}
              className="group flex flex-col items-center rounded-xl border border-hairline bg-white px-3 py-6 text-center shadow-card transition-all hover:-translate-y-1 hover:border-brand-blue-light hover:shadow-lift"
            >
              <span className="grid size-16 place-items-center rounded-full bg-brand-blue-tint text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                <Icon className="size-7" strokeWidth={1.6} />
              </span>
              <h2 className="mt-3 text-[13px] font-bold uppercase text-ink">{cat.title}</h2>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
