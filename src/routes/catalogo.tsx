import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useMemo } from "react";
import CatalogCategoryShowcase from "@/components/catalog/CatalogCategoryShowcase";
import CatalogHero from "@/components/catalog/CatalogHero";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES } from "@/lib/categories";
import { productMatchesCatalogQuery } from "@/lib/catalog-search";
import { LOCAL_CATALOG_PRODUCTS } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

type CatalogSearchParams = {
  q?: string;
};

export const Route = createFileRoute("/catalogo")({
  validateSearch: (raw: Record<string, unknown>): CatalogSearchParams => ({
    q: typeof raw.q === "string" && raw.q.trim() ? raw.q : undefined,
  }),
  head: () =>
    pageMeta({
      title: "Catálogo de EPIs — ItaSafety",
      description:
        "Busque a seleção de equipamentos de proteção individual publicada pela ItaSafety, navegue por categorias e monte sua lista de cotação.",
      path: "/catalogo",
    }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = search.q ?? "";

  const products = useMemo(() => {
    if (!query.trim()) return LOCAL_CATALOG_PRODUCTS;
    return LOCAL_CATALOG_PRODUCTS.filter((product) => productMatchesCatalogQuery(product, query));
  }, [query]);

  const updateQuery = (value: string) => {
    void navigate({
      search: { q: value.trimStart() || undefined },
      replace: true,
    });
  };

  return (
    <div className="bg-background">
      <CatalogHero />

      {!query && <CatalogCategoryShowcase />}

      {query ? (
        <section
          className="section-functional border-y border-border bg-surface"
          aria-labelledby="catalog-products-title"
        >
          <Container>
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-label font-semibold text-primary">Busca no acervo migrado</p>
                <h2
                  id="catalog-products-title"
                  className="mt-2 text-h2 font-semibold text-foreground"
                >
                  Resultados para “{query}”
                </h2>
              </div>
              <Button type="button" variant="ghost" onClick={() => updateQuery("")}>
                Limpar busca
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <CatalogProductCard key={product.sku} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum produto encontrado"
                description="Tente outro nome, código, categoria ou CA. A busca considera os 96 produtos recuperados do catálogo ItaSafety."
                action={
                  <Button type="button" onClick={() => updateQuery("")}>
                    Limpar busca
                  </Button>
                }
              />
            )}
          </Container>
        </section>
      ) : (
        <div className="border-t border-border">
          {CATEGORIES.map((category, index) => {
            const categoryProducts = LOCAL_CATALOG_PRODUCTS.filter(
              (product) => product.categorySlug === category.slug,
            );
            if (categoryProducts.length === 0) return null;

            return (
              <section
                key={category.slug}
                className={`catalog-shelf section-functional border-b border-border ${
                  index % 2 === 0 ? "bg-surface" : "bg-background"
                }`}
                aria-labelledby={`catalog-shelf-${category.slug}`}
              >
                <Container>
                  <div className="mb-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-label font-semibold text-primary">
                        {categoryProducts.length}{" "}
                        {categoryProducts.length === 1 ? "produto" : "produtos"}
                      </p>
                      <h2
                        id={`catalog-shelf-${category.slug}`}
                        className="mt-2 text-h2 font-semibold text-foreground"
                      >
                        {category.title}
                      </h2>
                    </div>
                    <Link
                      to="/departamento/$slug"
                      params={{ slug: category.slug }}
                      className="focus-ring motion-colors hidden min-h-11 items-center gap-2 rounded-sm text-label font-semibold text-primary hover:text-primary-hover sm:inline-flex"
                    >
                      Ver categoria
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>

                  <div className="catalog-product-rail">
                    {categoryProducts.map((product) => (
                      <CatalogProductCard
                        key={product.sku}
                        product={product}
                        className="catalog-product-rail__item"
                      />
                    ))}
                  </div>

                  <Link
                    to="/departamento/$slug"
                    params={{ slug: category.slug }}
                    className="focus-ring motion-colors mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-label font-semibold text-primary hover:text-primary-hover sm:hidden"
                  >
                    Ver categoria
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Container>
              </section>
            );
          })}
        </div>
      )}

      <section
        className="border-t border-border bg-surface-inverse py-10"
        aria-label="Ajuda comercial"
      >
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title font-semibold text-foreground-inverse">
              Não encontrou o item necessário?
            </h2>
            <p className="mt-1 text-body-sm text-white/70">
              Compartilhe sua necessidade e organize a próxima etapa com a equipe ItaSafety.
            </p>
          </div>
          <Button
            asChild
            className="self-start bg-white text-foreground hover:bg-primary-muted sm:self-auto"
          >
            <Link to="/contato">
              <MessageCircle className="size-4" aria-hidden />
              Falar com a equipe
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  );
}
