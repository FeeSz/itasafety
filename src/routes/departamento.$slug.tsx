import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Search as SearchIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/categories";
import { FEATURED_PRODUCTS, type Product } from "@/lib/products";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";
import Reveal from "@/components/ui/Reveal";
import { pageMeta } from "@/lib/seo";

type SortKey = "relevance" | "name-asc" | "name-desc" | "newest";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Relevância" },
  { id: "name-asc", label: "Nome (A–Z)" },
  { id: "name-desc", label: "Nome (Z–A)" },
  { id: "newest", label: "Novidades" },
];

type DepartamentoSearch = {
  q?: string;
  sub?: string;
  sort?: SortKey;
};

export const Route = createFileRoute("/departamento/$slug")({
  validateSearch: (raw: Record<string, unknown>): DepartamentoSearch => {
    const sort = (raw.sort as SortKey) ?? "relevance";
    return {
      q: typeof raw.q === "string" ? raw.q : undefined,
      sub: typeof raw.sub === "string" ? raw.sub : undefined,
      sort: SORTS.some((s) => s.id === sort) ? sort : "relevance",
    };
  },
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData, params }) => {
    const title = loaderData ? `${loaderData.cat.title} — EPIs ItaSafety` : "Categoria — ItaSafety";
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
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const Icon = cat.icon;
  const baseList = useMemo(() => {
    const inCat = FEATURED_PRODUCTS.filter((p) => p.categorySlug === cat.slug);
    return inCat.length ? inCat : FEATURED_PRODUCTS;
  }, [cat.slug]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.ca.toLowerCase().includes(q),
      );
    }
    if (search.sub) {
      const sub = search.sub.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(sub));
    }
    const sorted = [...list];
    switch (search.sort) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        sorted.sort((a, b) => {
          const an = a.tags?.includes("novo") ? 1 : 0;
          const bn = b.tags?.includes("novo") ? 1 : 0;
          return bn - an;
        });
        break;
      default:
        break;
    }
    return sorted;
  }, [baseList, search.q, search.sub, search.sort]);

  const setSearch = (next: Partial<DepartamentoSearch>) => {
    navigate({
      search: (prev: DepartamentoSearch) => ({ ...prev, ...next }),
      replace: true,
    });
  };

  const activeFilters = [search.q, search.sub].filter(Boolean).length;

  const Sidebar = (
    <div className="space-y-4">
      {/* Busca dentro da categoria */}
      <div className="rounded-xl border border-hairline bg-white p-5">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
          Buscar nesta categoria
        </h2>
        <div className="mt-3 flex overflow-hidden rounded-md border border-hairline focus-within:border-brand-blue">
          <span className="grid place-items-center pl-3 text-ink-soft">
            <SearchIcon className="size-4" />
          </span>
          <input
            type="search"
            defaultValue={search.q ?? ""}
            onChange={(e) => setSearch({ q: e.target.value.trim() || undefined })}
            placeholder="SKU, CA, nome..."
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            aria-label="Buscar produtos"
          />
        </div>
      </div>

      {/* Subcategorias */}
      <div className="rounded-xl border border-hairline bg-white p-5">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
          Subcategorias
        </h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            <button
              type="button"
              onClick={() => setSearch({ sub: undefined })}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                !search.sub
                  ? "bg-brand-blue-tint text-brand-blue font-semibold"
                  : "text-ink-muted hover:bg-surface-sunken"
              }`}
            >
              Todas
              {!search.sub && <Check className="size-3.5" />}
            </button>
          </li>
          {(cat.subcategories ?? []).map((s: string) => {
            const isActive = search.sub === s;
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setSearch({ sub: isActive ? undefined : s })}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-brand-blue-tint text-brand-blue font-semibold"
                      : "text-ink-muted hover:bg-surface-sunken"
                  }`}
                >
                  <span>{s}</span>
                  {isActive && <Check className="size-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tags rápidas */}
      <div className="rounded-xl border border-hairline bg-white p-5">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
          Filtros rápidos
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["CA Ativo", "Pronta entrega", "Novidade", "Mais vendido"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-hairline px-3 py-1 text-[11px] font-semibold text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Outras categorias */}
      <div className="rounded-xl border border-hairline bg-white p-5">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
          Outras categorias
        </h2>
        <ul className="mt-3 space-y-1 text-sm">
          {CATEGORIES.filter((c) => c.slug !== cat.slug)
            .slice(0, 10)
            .map((c) => {
              const CIcon = c.icon;
              return (
                <li key={c.slug}>
                  <Link
                    to="/departamento/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand-blue"
                  >
                    <CIcon className="size-4 text-brand-blue" />
                    {c.title}
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-surface-sunken">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs text-ink-muted">
          <Link to="/" className="hover:text-brand-blue">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/categorias" className="hover:text-brand-blue">
            Categorias
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-ink">{cat.title}</span>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-blue-tint text-brand-blue">
            <Icon className="size-8" strokeWidth={1.6} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-ink">{cat.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              EPIs certificados (CA ativo) para indústria, construção e serviços. Solicite cotação
              técnica.
            </p>
          </div>
        </div>
      </section>

      {/* Layout: sidebar + grid */}
      <section className="bg-surface-sunken py-8 md:py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:px-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">{Sidebar}</aside>

          <div>
            {/* Top bar */}
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-sm font-semibold text-ink lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filtros
                {activeFilters > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-blue px-1 text-[10px] font-bold text-white">
                    {activeFilters}
                  </span>
                )}
              </button>

              <p className="text-sm text-ink-muted">
                <span className="font-bold text-ink">{filtered.length}</span> produto
                {filtered.length === 1 ? "" : "s"}
                {search.q && (
                  <>
                    {" "}
                    para <span className="text-ink">"{search.q}"</span>
                  </>
                )}
              </p>

              <div className="ml-auto flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="hidden text-xs font-semibold text-ink-muted sm:block"
                >
                  Ordenar por:
                </label>
                <select
                  id="sort"
                  value={search.sort ?? "relevance"}
                  onChange={(e) => setSearch({ sort: e.target.value as SortKey })}
                  className="rounded-md border border-hairline bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand-blue"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {activeFilters > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {search.q && (
                  <FilterChip
                    label={`Busca: ${search.q}`}
                    onClear={() => setSearch({ q: undefined })}
                  />
                )}
                {search.sub && (
                  <FilterChip label={search.sub} onClear={() => setSearch({ sub: undefined })} />
                )}
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline bg-white p-12 text-center">
                <p className="font-semibold text-ink">Nenhum produto encontrado</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Tente ajustar a busca ou remover filtros.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch({ q: undefined, sub: undefined })}
                  className="mt-5 inline-block rounded-md bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-hover"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <Reveal key={p.sku} delay={Math.min(i * 40, 240)}>
                    <ProductCard p={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 animate-fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl bg-surface-sunken p-4 animate-slide-down">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Filtros</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-10 place-items-center rounded-md text-ink-muted"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            {Sidebar}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 w-full rounded-md bg-brand-blue py-3 text-sm font-bold text-white hover:bg-brand-blue-hover"
            >
              Ver {filtered.length} produto{filtered.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue-tint px-3 py-1 text-xs font-semibold text-brand-blue">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remover filtro ${label}`}
        className="grid size-4 place-items-center rounded-full hover:bg-brand-blue hover:text-white"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useQuoteCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNew = p.tags?.includes("novo");
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-soft hover:shadow-lift">
      <Link
        to="/detalhes/$sku"
        params={{ sku: p.sku }}
        className="relative aspect-square overflow-hidden bg-white p-4"
      >
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="size-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-brand-blue px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          CA {p.ca}
        </span>
        {isNew && (
          <span className="absolute right-3 top-3 rounded-sm bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Novo
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-light">
          {p.category}
        </p>
        <Link
          to="/detalhes/$sku"
          params={{ sku: p.sku }}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink hover:text-brand-blue"
        >
          {p.name}
        </Link>
        <p className="mt-1 font-mono text-[11px] text-ink-soft">Ref: {p.sku}</p>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              toast.error("Por favor, faça login para solicitar uma cotação.");
              navigate({ to: "/auth" });
              return;
            }
            add(p, 1);
            toast.success("Adicionado à lista de cotação", {
              description: p.name,
            });
          }}
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-blue text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-blue-hover hover:shadow-[0_4px_12px_rgba(27,79,138,0.3)]"
        >
          <ShoppingCart className="size-4" />
          Solicitar Cotação
        </button>
      </div>
    </article>
  );
}
