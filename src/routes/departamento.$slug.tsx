import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import Eyebrow from "@/components/ui/Eyebrow";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/categories";
import { productMatchesCatalogQuery } from "@/lib/catalog-search";
import { LOCAL_CATALOG_PRODUCTS } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

type SortKey = "relevance" | "name-asc" | "name-desc";

const SORTS: ReadonlyArray<{ id: SortKey; label: string }> = [
  { id: "relevance", label: "Ordem publicada" },
  { id: "name-asc", label: "Nome (A–Z)" },
  { id: "name-desc", label: "Nome (Z–A)" },
];

type DepartmentSearch = {
  q?: string;
  sort?: SortKey;
};

export const Route = createFileRoute("/departamento/$slug")({
  validateSearch: (raw: Record<string, unknown>): DepartmentSearch => {
    const requestedSort = typeof raw.sort === "string" ? raw.sort : "relevance";
    const sort = SORTS.some((item) => item.id === requestedSort)
      ? (requestedSort as SortKey)
      : "relevance";

    return {
      q: typeof raw.q === "string" && raw.q.trim() ? raw.q : undefined,
      sort,
    };
  },
  loader: ({ params }) => {
    const category = CATEGORIES.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { categorySlug: category.slug, categoryTitle: category.title };
  },
  head: ({ loaderData, params }) =>
    pageMeta({
      title: loaderData
        ? `${loaderData.categoryTitle} — Catálogo ItaSafety`
        : "Categoria — ItaSafety",
      description: loaderData
        ? `Consulte os produtos atualmente publicados na categoria ${loaderData.categoryTitle} e adicione itens à sua lista de cotação.`
        : "Consulte uma categoria do catálogo ItaSafety.",
      path: `/departamento/${params.slug}`,
    }),
  errorComponent: () => (
    <Container size="md" className="section-functional">
      <ErrorState
        title="Não foi possível carregar esta categoria"
        description="Tente novamente ou volte ao índice de categorias."
        action={
          <Button asChild variant="outline">
            <Link to="/categorias">Ver categorias</Link>
          </Button>
        }
      />
    </Container>
  ),
  notFoundComponent: () => (
    <Container size="md" className="section-functional">
      <ErrorState
        title="Categoria não encontrada"
        description="O endereço não corresponde a uma categoria atualmente publicada."
        action={
          <Button asChild variant="outline">
            <Link to="/categorias">Ver categorias disponíveis</Link>
          </Button>
        }
      />
    </Container>
  ),
  component: DepartmentPage,
});

function DepartmentPage() {
  const { categorySlug } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const category = CATEGORIES.find((item) => item.slug === categorySlug);

  if (!category) return null;

  const products = (() => {
    const inCategory = LOCAL_CATALOG_PRODUCTS.filter(
      (product) => product.categorySlug === category.slug,
    );
    const filtered = search.q
      ? inCategory.filter((product) => productMatchesCatalogQuery(product, search.q ?? ""))
      : inCategory;

    if (search.sort === "name-asc") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }
    if (search.sort === "name-desc") {
      return [...filtered].sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
    }
    return filtered;
  })();

  const updateSearch = (next: Partial<DepartmentSearch>) => {
    void navigate({
      search: {
        q: next.q !== undefined ? next.q || undefined : search.q,
        sort: next.sort ?? search.sort,
      },
      replace: true,
    });
  };

  return (
    <div className="bg-background">
      <nav className="border-b border-border bg-surface" aria-label="Breadcrumb">
        <Container className="flex min-h-11 items-center gap-2 overflow-x-auto py-2 text-caption text-foreground-muted">
          <Link
            to="/catalogo"
            className="focus-ring motion-colors shrink-0 rounded-sm hover:text-primary"
          >
            Catálogo
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden />
          <Link
            to="/categorias"
            className="focus-ring motion-colors shrink-0 rounded-sm hover:text-primary"
          >
            Categorias
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden />
          <span className="truncate font-semibold text-foreground">{category.title}</span>
        </Container>
      </nav>

      <section className="section-functional bg-surface" aria-labelledby="department-title">
        <Container>
          <Eyebrow>Categoria</Eyebrow>
          <h1 id="department-title" className="mt-2 text-h1 font-semibold text-foreground">
            {category.title}
          </h1>
          <p className="mt-2 max-w-2xl text-body-sm text-foreground-muted">
            Produtos recuperados do catálogo ItaSafety, prontos para seleção e cotação.
          </p>
        </Container>
      </section>

      <section className="section-functional" aria-label={`Produtos de ${category.title}`}>
        <Container>
          <div className="grid gap-5 border-y border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label
                htmlFor="department-search"
                className="text-label font-semibold text-foreground"
              >
                Buscar nesta categoria
              </label>
              <div className="relative mt-2">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
                <Input
                  id="department-search"
                  type="search"
                  value={search.q ?? ""}
                  onChange={(event) => updateSearch({ q: event.target.value.trimStart() })}
                  placeholder="Nome, código ou CA informado"
                  className="h-12 pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="department-sort" className="text-label font-semibold text-foreground">
                Ordenar
              </label>
              <select
                id="department-sort"
                value={search.sort ?? "relevance"}
                onChange={(event) => updateSearch({ sort: event.target.value as SortKey })}
                className="input mt-2 h-12 w-full font-semibold sm:w-48"
              >
                {SORTS.map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="my-5 text-body-sm text-foreground-muted" aria-live="polite">
            <strong className="text-foreground">{products.length}</strong>{" "}
            {products.length === 1 ? "produto publicado" : "produtos publicados"}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <CatalogProductCard key={product.sku} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum produto publicado aqui"
              description="Limpe a busca, escolha outra categoria ou fale com a equipe comercial para localizar uma alternativa."
              action={
                <>
                  {search.q && (
                    <Button type="button" onClick={() => updateSearch({ q: "" })}>
                      Limpar busca
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link to="/contato">Falar com a equipe</Link>
                  </Button>
                </>
              }
            />
          )}
        </Container>
      </section>
    </div>
  );
}
