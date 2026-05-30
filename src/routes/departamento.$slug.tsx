import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { FEATURED_PRODUCTS } from "@/lib/products";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/departamento/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData, params }) => {
    const title = loaderData
      ? `${loaderData.cat.title} — EPIs ItaSafety`
      : "Categoria — ItaSafety";
    const description = loaderData
      ? `${loaderData.cat.title}: EPIs certificados (CA ativo) com pronta entrega para indústrias. Solicite cotação na ItaSafety.`
      : "Categoria de EPIs ItaSafety.";
    return pageMeta({
      title,
      description,
      path: `/departamento/${params.slug}`,
    });
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl p-10 text-center">
      <p className="text-ink-muted">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl p-10 text-center">
      <h1 className="text-2xl font-bold text-ink">Categoria não encontrada</h1>
      <Link to="/" className="mt-4 inline-block text-brand-blue underline">
        Voltar ao início
      </Link>
    </div>
  ),
  component: DepartamentoPage,
});

function DepartamentoPage() {
  const { cat } = Route.useLoaderData();
  const { add } = useQuoteCart();
  const products = FEATURED_PRODUCTS.filter(
    (p) => p.categorySlug === cat.slug,
  );
  const list = products.length ? products : FEATURED_PRODUCTS;
  const Icon = cat.icon;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-surface-sunken">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs text-ink-muted">
          <Link to="/" className="hover:text-brand-blue">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-ink">{cat.title}</span>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-6">
          <span className="grid size-16 place-items-center rounded-full bg-brand-blue-tint text-brand-blue">
            <Icon className="size-8" strokeWidth={1.6} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-ink">{cat.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {list.length} produto{list.length === 1 ? "" : "s"} disponível
              {list.length === 1 ? "" : "is"}
            </p>
          </div>
        </div>
      </section>

      {/* Layout: sidebar + grid */}
      <section className="bg-surface-sunken py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar filtros */}
          <aside className="hidden lg:block">
            <div className="rounded-xl border border-hairline bg-white p-5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                Subcategorias
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {(cat.subcategories ?? ["Todos os produtos"]).map((s: string) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="block w-full rounded-md px-3 py-2 text-left text-ink-muted transition-colors hover:bg-brand-blue-tint hover:text-brand-blue"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-xl border border-hairline bg-white p-5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                Outras Categorias
              </h2>
              <ul className="mt-3 space-y-1 text-sm">
                {CATEGORIES.filter((c) => c.slug !== cat.slug)
                  .slice(0, 8)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/departamento/$slug"
                        params={{ slug: c.slug }}
                        className="block rounded px-2 py-1.5 text-ink-muted hover:bg-surface-sunken hover:text-brand-blue"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {list.map((p) => (
              <article
                key={p.sku}
                className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Link
                  to="/detalhes/$sku"
                  params={{ sku: p.sku }}
                  className="relative aspect-square overflow-hidden bg-surface-sunken p-4"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-sm bg-brand-blue px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    CA Aprovado
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-light">
                    {p.category}
                  </p>
                  <Link
                    to="/detalhes/$sku"
                    params={{ sku: p.sku }}
                    className="mt-1 line-clamp-2 text-sm font-semibold text-ink hover:text-brand-blue"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 font-mono text-[11px] text-ink-soft">
                    Ref: {p.sku} · CA {p.ca}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      add(p, 1);
                      toast.success("Adicionado à lista de cotação");
                    }}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-brand-blue-hover"
                  >
                    <ShoppingCart className="size-4" />
                    Solicitar Cotação
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
