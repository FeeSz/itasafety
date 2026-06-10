import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Award,
  Check,
  ExternalLink,
  Search,
  Share2,
  FileText,
  Minus,
  Plus,
} from "lucide-react";
import { FEATURED_PRODUCTS, type Product } from "@/lib/products";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { toast } from "sonner";
import { pageMeta, SITE_URL, abs } from "@/lib/seo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Reveal from "@/components/ui/Reveal";

export const Route = createFileRoute("/detalhes/$sku")({
  loader: ({ params }) => {
    const product = FEATURED_PRODUCTS.find((p) => p.sku === params.sku);
    if (!product) throw notFound();
    const related = FEATURED_PRODUCTS.filter(
      (p) => p.categorySlug === product.categorySlug && p.sku !== product.sku,
    ).slice(0, 4);
    return { product, related };
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
      <Link to="/" className="text-brand-blue underline">
        Voltar
      </Link>
    </div>
  ),
  component: DetalhesPage,
});

function buildSpecs(product: Product) {
  return [
    { label: "SKU / Referência", value: product.sku },
    { label: "Categoria", value: product.category },
    { label: "CA (MTE)", value: product.ca },
    { label: "Fabricante", value: "Homologado ItaSafety" },
    { label: "Garantia", value: "Garantia do fabricante" },
    { label: "Disponibilidade", value: "Pronta entrega / sob cotação" },
  ];
}

const NORMAS_POR_CATEGORIA: Record<string, string[]> = {
  capacetes: ["NR-6", "NBR 8221", "ANSI Z89.1"],
  "protecao-visual": ["NR-6", "ANSI Z87.1", "EN 166"],
  "protecao-respiratoria": ["NR-6", "NBR 13694", "EN 143 / EN 14387"],
  "protecao-auditiva": ["NR-6", "NBR 16077", "ANSI S3.19"],
  luvas: ["NR-6", "EN 388", "EN 374"],
  calcados: ["NR-6", "NBR ISO 20345", "EN ISO 20345"],
  diversos: ["NR-6", "NR-35", "ABNT NBR 14629"],
  "solda-facial": ["NR-6", "ANSI Z87.1", "EN 175"],
};

function DetalhesPage() {
  const { product, related } = Route.useLoaderData();
  const { add } = useQuoteCart();
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const gallery = useMemo(() => [product.image, product.image, product.image], [product.image]);
  const specs = useMemo(() => buildSpecs(product), [product]);
  const normas = NORMAS_POR_CATEGORIA[product.categorySlug] ?? ["NR-6"];

  const handleShare = async () => {
    const url = `${SITE_URL}/detalhes/${product.sku}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-surface-sunken">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs text-ink-muted">
          <Link to="/" className="hover:text-brand-blue">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/departamento/$slug"
            params={{ slug: product.categorySlug }}
            className="hover:text-brand-blue"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 font-semibold text-ink">{product.name}</span>
        </div>
      </div>

      {/* Hero do produto */}
      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          {/* Galeria */}
          <div>
            <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface-sunken p-8">
              <img
                src={gallery[imgIdx]}
                alt={product.name}
                className="mx-auto h-[420px] w-full object-contain"
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-sm bg-brand-blue px-3 py-1 text-[11px] font-bold uppercase text-white shadow-soft">
                <ShieldCheck className="size-3.5" /> CA {product.ca}
              </span>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartilhar produto"
                className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow-soft transition-colors hover:text-brand-blue"
              >
                <Share2 className="size-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`overflow-hidden rounded-md border-2 bg-surface-sunken p-2 transition-all ${
                    imgIdx === i
                      ? "border-brand-blue ring-2 ring-brand-blue/20"
                      : "border-hairline hover:border-brand-blue/50"
                  }`}
                  aria-label={`Imagem ${i + 1}`}
                >
                  <img src={src} alt="" className="aspect-square w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-brand-blue-light">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-ink lg:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-ink-soft">Ref: {product.sku}</p>

            <p className="mt-5 text-base leading-relaxed text-ink-muted">{product.description}</p>

            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Certificado de Aprovação (CA) ativo",
                "Disponível em estoque",
                "Garantia do fabricante",
                "Atendimento técnico especializado",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-ink-muted">
                  <Check className="size-4 text-brand-blue" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Consulta CA */}
            <div className="mt-6 rounded-lg border border-hairline bg-surface-sunken p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-brand-blue/10 p-2 text-brand-blue">
                  <Search className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">Consulta de CA</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Verifique a validade do Certificado de Aprovação diretamente no portal do
                    Ministério do Trabalho.
                  </p>
                  <a
                    href={`https://consultaca.com/${product.ca}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
                  >
                    Consultar CA {product.ca}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quantidade + CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label htmlFor="product-qty" className="text-sm font-semibold text-ink">
                Quantidade:
              </label>
              <div className="inline-flex items-center rounded-md border border-hairline">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex size-10 items-center justify-center text-ink-muted hover:text-brand-blue"
                  aria-label="Diminuir"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  id="product-qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-14 border-x border-hairline py-2 text-center text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="inline-flex size-10 items-center justify-center text-ink-muted hover:text-brand-blue"
                  aria-label="Aumentar"
                >
                  <Plus className="size-4" />
                </button>
              </div>
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

      {/* Tabs Especificações / Normas / Aplicações */}
      <section className="bg-surface-sunken py-12">
        <div className="mx-auto max-w-7xl px-6">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="h-auto w-full justify-start gap-1 rounded-lg bg-white p-1 shadow-soft md:w-auto">
              <TabsTrigger value="specs" className="px-5 py-2.5 text-sm font-semibold">
                Especificações
              </TabsTrigger>
              <TabsTrigger value="normas" className="px-5 py-2.5 text-sm font-semibold">
                Normas & Certificação
              </TabsTrigger>
              <TabsTrigger value="aplicacoes" className="px-5 py-2.5 text-sm font-semibold">
                Aplicações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-6">
              <div className="overflow-hidden rounded-lg border border-hairline bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-hairline">
                    {specs.map((s) => (
                      <tr key={s.label} className="even:bg-surface-sunken/50">
                        <th
                          scope="row"
                          className="w-1/3 px-5 py-3 text-left font-semibold text-ink"
                        >
                          {s.label}
                        </th>
                        <td className="px-5 py-3 text-ink-muted">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="normas" className="mt-6">
              <div className="rounded-lg border border-hairline bg-white p-6">
                <p className="text-sm text-ink-muted">
                  Este EPI atende às seguintes normas e referências técnicas:
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {normas.map((n) => (
                    <span
                      key={n}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-blue"
                    >
                      <ShieldCheck className="size-3.5" />
                      {n}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`https://consultaca.com/${product.ca}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-hover"
                  >
                    <FileText className="size-4" /> Consultar CA {product.ca}
                  </a>
                  <Link
                    to="/contato"
                    className="inline-flex items-center gap-2 rounded-md border border-hairline bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand-blue hover:text-brand-blue"
                  >
                    Solicitar ficha técnica
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aplicacoes" className="mt-6">
              <div className="rounded-lg border border-hairline bg-white p-6">
                <p className="text-sm text-ink-muted">
                  Indicado para uso profissional em ambientes industriais que exijam proteção
                  conforme NR-6 e demais normas regulamentadoras aplicáveis.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
                  {[
                    "Construção civil e infraestrutura",
                    "Indústria petroquímica e energia",
                    "Logística, armazéns e portos",
                    "Mineração e metalurgia",
                    "Manutenção industrial",
                    "Setor elétrico",
                  ].map((a) => (
                    <li key={a} className="flex items-center gap-2">
                      <Check className="size-4 text-brand-blue" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-brand-blue-light">
                  Você também pode gostar
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-ink lg:text-3xl">
                  Produtos relacionados
                </h2>
              </div>
              <Link
                to="/departamento/$slug"
                params={{ slug: product.categorySlug }}
                className="hidden text-sm font-semibold text-brand-blue hover:underline sm:inline-flex"
              >
                Ver toda a categoria →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p, i) => (
                <Reveal key={p.sku} delay={i * 60}>
                  <Link
                    to="/detalhes/$sku"
                    params={{ sku: p.sku }}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-white transition-all hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-lift"
                  >
                    <div className="aspect-square overflow-hidden bg-surface-sunken p-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-contain transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-light">
                        CA {p.ca}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-ink group-hover:text-brand-blue">
                        {p.name}
                      </h3>
                      <span className="mt-auto pt-3 text-xs font-semibold text-brand-blue">
                        Ver detalhes →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
