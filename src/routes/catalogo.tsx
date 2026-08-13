import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useMemo } from "react";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import CatalogSearch from "@/components/catalog/CatalogSearch";
import CategoryGrid from "@/components/sections/CategoryGrid";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import Eyebrow from "@/components/ui/Eyebrow";
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
    const term = query.trim().toLocaleLowerCase("pt-BR");
    if (!term) return LOCAL_CATALOG_PRODUCTS;

    return LOCAL_CATALOG_PRODUCTS.filter((product) =>
      [product.name, product.sku, product.category, product.ca, product.description]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(term),
    );
  }, [query]);

  const updateQuery = (value: string) => {
    void navigate({
      search: { q: value.trimStart() || undefined },
      replace: true,
    });
  };

  return (
    <div className="bg-background">
      <section
        className="section-functional border-b border-border bg-surface"
        aria-labelledby="catalog-title"
      >
        <Container>
          <Eyebrow>Produtos</Eyebrow>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:items-end">
            <div>
              <h1 id="catalog-title" className="mt-3 text-h1 font-semibold text-foreground">
                Catálogo ItaSafety
              </h1>
              <p className="mt-3 max-w-2xl text-body text-foreground-muted">
                Busque na seleção atualmente publicada, explore categorias e adicione os itens que
                deseja cotar. Nenhum login é necessário para montar a lista.
              </p>
            </div>
            <CatalogSearch
              value={query}
              onValueChange={updateQuery}
              resultCount={products.length}
            />
          </div>
        </Container>
      </section>

      <section className="section-functional" aria-labelledby="catalog-categories-title">
        <Container>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Descobrir</Eyebrow>
              <h2
                id="catalog-categories-title"
                className="mt-2 text-h2 font-semibold text-foreground"
              >
                Categorias principais
              </h2>
            </div>
            <Button asChild variant="ghost" className="self-start sm:self-auto">
              <Link to="/categorias">
                Ver todas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <CategoryGrid limit={8} />
        </Container>
      </section>

      <section
        className="section-functional border-t border-border bg-surface"
        aria-labelledby="catalog-products-title"
      >
        <Container>
          <div className="mb-7">
            <Eyebrow>Selecionar</Eyebrow>
            <h2 id="catalog-products-title" className="mt-2 text-h2 font-semibold text-foreground">
              {query ? "Resultados da busca" : "Produtos publicados"}
            </h2>
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
              description="Tente outro nome, referência, categoria ou CA informado. A seleção publicada ainda é limitada e não representa todo o portfólio comercial."
              action={
                <Button type="button" onClick={() => updateQuery("")}>
                  Limpar busca
                </Button>
              }
            />
          )}
        </Container>
      </section>

      <section className="border-t border-border py-8" aria-label="Ajuda comercial">
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title font-semibold text-foreground">
              Não encontrou o item necessário?
            </h2>
            <p className="mt-1 text-body-sm text-foreground-muted">
              Converse com a equipe para orientar sua busca.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto">
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
