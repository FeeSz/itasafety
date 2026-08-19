import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import Eyebrow from "@/components/ui/Eyebrow";
import { Surface } from "@/components/ui/Surface";
import { useQuoteCart } from "@/hooks/use-quote-cart";
import { LOCAL_CATALOG_PRODUCTS, type Product } from "@/lib/products";
import { abs, pageMeta, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/detalhes/$sku")({
  loader: ({ params }) => {
    const product = LOCAL_CATALOG_PRODUCTS.find((item) => item.sku === params.sku);
    if (!product) throw notFound();
    const related = LOCAL_CATALOG_PRODUCTS.filter(
      (item) => item.categorySlug === product.categorySlug && item.sku !== product.sku,
    ).slice(0, 4);
    return { product, related };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return pageMeta({
        title: "Produto — ItaSafety",
        description: "Consulte os dados publicados de um produto ItaSafety.",
        path: `/detalhes/${params.sku}`,
      });
    }

    return pageMeta({
      title: `${loaderData.product.name} — ItaSafety`,
      description:
        loaderData.product.description ??
        `Consulte ${loaderData.product.name} no catálogo ItaSafety e solicite uma cotação.`,
      path: `/detalhes/${params.sku}`,
      image: loaderData.product.image ? abs(loaderData.product.image) : undefined,
    });
  },
  errorComponent: () => (
    <Container size="md" className="section-functional">
      <ErrorState
        title="Não foi possível carregar este produto"
        description="Tente novamente ou retorne ao catálogo publicado."
        action={
          <Button asChild variant="outline">
            <Link to="/catalogo">Voltar ao catálogo</Link>
          </Button>
        }
      />
    </Container>
  ),
  notFoundComponent: () => (
    <Container size="md" className="section-functional">
      <ErrorState
        title="Produto não encontrado"
        description="O endereço não corresponde a um produto atualmente publicado."
        action={
          <Button asChild variant="outline">
            <Link to="/catalogo">Ver produtos publicados</Link>
          </Button>
        }
      />
    </Container>
  ),
  component: ProductDetailsPage,
});

function trustedSpecs(product: Product) {
  const specs = [
    { label: "Código do catálogo", value: product.sku },
    { label: "Categoria", value: product.category },
  ];
  if (product.ca) specs.push({ label: "CA informado no acervo legado", value: product.ca });
  return specs;
}

function ProductDetailsPage() {
  const { product, related } = Route.useLoaderData();
  const { add } = useQuoteCart();
  const [quantity, setQuantity] = useState(1);
  const specs = useMemo(() => trustedSpecs(product), [product]);

  const updateQuantity = (next: number) => {
    setQuantity(Math.max(1, Math.min(9999, next)));
  };

  const addToList = () => {
    add(product, quantity);
    toast.success("Produto adicionado à lista", {
      description: `${quantity} × ${product.name}`,
    });
  };

  const shareProduct = async () => {
    const url = `${SITE_URL}/detalhes/${product.sku}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar o produto.");
    }
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
            to="/departamento/$slug"
            params={{ slug: product.categorySlug }}
            className="focus-ring motion-colors shrink-0 rounded-sm hover:text-primary"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden />
          <span className="truncate font-semibold text-foreground">{product.name}</span>
        </Container>
      </nav>

      <section className="section-functional bg-surface" aria-labelledby="product-title">
        <Container className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative flex min-h-[20rem] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted p-6 sm:min-h-[28rem] sm:p-10">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                width={640}
                height={640}
                className="max-h-[26rem] w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="flex max-w-xs items-center justify-center text-center text-title font-semibold text-foreground-muted">
                {product.category}
              </div>
            )}
            {product.imageNote ? (
              <p className="absolute bottom-4 left-4 rounded-full bg-surface/92 px-3 py-1.5 text-caption font-medium text-foreground-muted shadow-subtle">
                {product.imageNote}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={() => void shareProduct()}
              aria-label="Compartilhar produto"
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 bg-surface shadow-subtle"
            >
              <Share2 className="size-4" aria-hidden />
            </Button>
          </div>

          <div className="self-center">
            <Eyebrow>{product.category}</Eyebrow>
            <h1 id="product-title" className="mt-2 text-h2 font-semibold text-foreground">
              {product.name}
            </h1>
            <p className="mt-2 font-mono text-data text-foreground-subtle">Cód. {product.sku}</p>
            <p className="mt-5 text-body text-foreground-muted">
              {product.description ??
                "A fonte legada não publicou uma descrição para este item. Confirme aplicação, disponibilidade e especificações com a equipe ItaSafety."}
            </p>

            <Surface variant="muted" padding="sm" className="mt-6 border-info/20">
              <p className="text-body-sm font-semibold text-foreground">
                {product.ca
                  ? `CA informado no acervo legado: ${product.ca}`
                  : "CA não informado no acervo legado"}
              </p>
              <p className="mt-1 text-caption text-foreground-muted">
                O status do CA, fabricante, estoque, normas, aplicações e garantia não são
                confirmados por esta fonte local. Valide os requisitos técnicos antes da decisão de
                uso.
              </p>
            </Surface>

            <div className="mt-7">
              <label
                htmlFor="product-quantity"
                className="text-label font-semibold text-foreground"
              >
                Quantidade
              </label>
              <div className="mt-2 inline-flex items-center rounded-md border border-border-strong bg-surface">
                <Button
                  type="button"
                  onClick={() => updateQuantity(quantity - 1)}
                  aria-label="Diminuir quantidade"
                  variant="ghost"
                  size="icon"
                  className="rounded-r-none"
                >
                  <Minus className="size-4" aria-hidden />
                </Button>
                <input
                  id="product-quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={9999}
                  value={quantity}
                  onChange={(event) => updateQuantity(Number(event.target.value) || 1)}
                  className="focus-ring h-11 w-20 border-x border-border bg-surface text-center text-body font-semibold text-foreground"
                />
                <Button
                  type="button"
                  onClick={() => updateQuantity(quantity + 1)}
                  aria-label="Aumentar quantidade"
                  variant="ghost"
                  size="icon"
                  className="rounded-l-none"
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            <Button type="button" onClick={addToList} size="lg" className="mt-5 w-full sm:w-auto">
              <ShoppingCart className="size-5" aria-hidden />
              Adicionar à lista
            </Button>
          </div>
        </Container>
      </section>

      <section
        className="section-functional border-t border-border"
        aria-labelledby="product-data-title"
      >
        <Container>
          <h2 id="product-data-title" className="text-h3 font-semibold text-foreground">
            Dados publicados
          </h2>
          <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-hairline">
                {specs.map((spec) => (
                  <tr key={spec.label} className="even:bg-surface-raised/60">
                    <th
                      scope="row"
                      className="w-1/2 px-4 py-3 text-left font-semibold text-ink sm:w-1/3 sm:px-5"
                    >
                      {spec.label}
                    </th>
                    <td className="px-4 py-3 text-ink-muted sm:px-5">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/contato">Solicitar orientação técnica</Link>
          </Button>
        </Container>
      </section>

      {related.length > 0 && (
        <section
          className="section-functional border-t border-border bg-surface"
          aria-labelledby="related-products-title"
        >
          <Container>
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>Mesma categoria</Eyebrow>
                <h2
                  id="related-products-title"
                  className="mt-2 text-h3 font-semibold text-foreground"
                >
                  Produtos relacionados
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link to="/departamento/$slug" params={{ slug: product.categorySlug }}>
                  Ver categoria
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <CatalogProductCard key={item.sku} product={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
