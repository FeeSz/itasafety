import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, ShoppingCart, ShieldCheck, Truck, Award, Check } from "lucide-react";
import { FEATURED_PRODUCTS } from "@/lib/products";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { toast } from "sonner";
import { pageMeta, SITE_URL, abs } from "@/lib/seo";

export const Route = createFileRoute("/detalhes/$sku")({
  loader: ({ params }) => {
    const product = FEATURED_PRODUCTS.find((p) => p.sku === params.sku);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return pageMeta({
        title: "Produto — ItaSafety",
        description: "Detalhes do produto na ItaSafety.",
        path: `/detalhes/${params.sku}`,
      });
    }
    const { product } = loaderData;
    const image = abs(product.image);
    const base = pageMeta({
      title: `${product.name} (CA ${product.ca}) — ItaSafety`,
      description: product.description,
      path: `/detalhes/${params.sku}`,
      image,
      type: "product",
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            description: product.description,
            image,
            category: product.category,
            brand: { "@type": "Brand", name: "ItaSafety" },
            additionalProperty: [
              { "@type": "PropertyValue", name: "CA", value: product.ca },
            ],
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/detalhes/${product.sku}`,
              availability: "https://schema.org/InStock",
              priceCurrency: "BRL",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "BRL",
                description: "Sob cotação",
              },
            },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Produto não encontrado</h1>
      <Link to="/" className="text-brand-blue underline">Voltar</Link>
    </div>
  ),
  component: DetalhesPage,
});

function DetalhesPage() {
  const { product } = Route.useLoaderData();
  const { add } = useQuoteCart();
  const [qty, setQty] = useState(1);

  return (
    <>
      <div className="bg-surface-sunken">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs text-ink-muted">
          <Link to="/" className="hover:text-brand-blue">Home</Link>
          <ChevronRight className="size-3" />
          <Link
            to="/departamento/$slug"
            params={{ slug: product.categorySlug }}
            className="hover:text-brand-blue"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-ink line-clamp-1">{product.name}</span>
        </div>
      </div>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-surface-sunken p-10">
            <img
              src={product.image}
              alt={product.name}
              className="mx-auto size-full max-h-[420px] object-contain"
            />
            <span className="mt-4 inline-block rounded-sm bg-brand-blue px-3 py-1 text-[11px] font-bold uppercase text-white">
              CA Aprovado · {product.ca}
            </span>
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-brand-blue-light">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">{product.name}</h1>
            <p className="mt-1 font-mono text-sm text-ink-soft">Ref: {product.sku}</p>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              {product.description}
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              {["Certificado de Aprovação (CA) ativo", "Disponível em estoque", "Garantia do fabricante"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-ink-muted">
                  <Check className="size-4 text-brand-blue" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <label htmlFor="product-qty" className="text-sm font-semibold text-ink">Quantidade:</label>
              <input
                id="product-qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="w-20 rounded-md border border-hairline px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                add(product, qty);
                toast.success(`${qty}× adicionado à cotação`);
              }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-blue-hover hover:shadow-lift sm:w-auto"
            >
              <ShoppingCart className="size-5" />
              Adicionar à Lista de Cotação
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6 text-center text-xs text-ink-muted">
              <div>
                <ShieldCheck className="mx-auto size-6 text-brand-blue" />
                <p className="mt-1">CA Ativo</p>
              </div>
              <div>
                <Truck className="mx-auto size-6 text-brand-blue" />
                <p className="mt-1">Envio Nacional</p>
              </div>
              <div>
                <Award className="mx-auto size-6 text-brand-blue" />
                <p className="mt-1">Marca Homologada</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
