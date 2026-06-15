import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { FEATURED_PRODUCTS, type Product } from "@/lib/products";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "todos" | "mais-vendido" | "novo" | "certificado";

const TABS: { id: Tab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "mais-vendido", label: "Mais Vendidos" },
  { id: "novo", label: "Novidades" },
  { id: "certificado", label: "Certificados" },
];

export default function FeaturedProducts() {
  const [tab, setTab] = useState<Tab>("todos");
  const products = useMemo(
    () =>
      tab === "todos" ? FEATURED_PRODUCTS : FEATURED_PRODUCTS.filter((p) => p.tags?.includes(tab)),
    [tab],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[13px] font-semibold transition-colors ${
              tab === t.id
                ? "bg-brand-blue text-white"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.sku} p={p} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useQuoteCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (!user) {
      toast.error("Por favor, faça login para solicitar uma cotação.");
      navigate({ to: "/auth" });
      return;
    }
    add(p, 1);
    setAdded(true);
    toast.success("Adicionado à lista de cotação", { description: p.name });
    setTimeout(() => setAdded(false), 1500);
  };

  const isNew = p.tags?.includes("novo");

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-soft hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-white p-5">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="size-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-brand-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          CA Aprovado
        </span>
        {isNew && (
          <span className="absolute right-3 top-3 rounded-sm bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Novo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Link to="/detalhes/$sku" params={{ sku: p.sku }} className="block">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-light">
            {p.category}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-brand-blue">
            {p.name}
          </h3>
        </Link>
        <p className="mt-1 font-mono text-[11px] text-ink-soft">Ref: {p.sku}</p>
        <p className="text-[11px] font-semibold text-brand-blue">CA: {p.ca}</p>
        <button
          type="button"
          onClick={onAdd}
          className={`mt-3 inline-flex items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-semibold text-white transition-all ${
            added
              ? "bg-green-600"
              : "bg-[#111111] hover:-translate-y-0.5 hover:bg-[#374151] hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
          }`}
        >
          {added ? (
            <>
              <Check className="size-4" /> Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" /> Solicitar Cotação
            </>
          )}
        </button>
      </div>
    </article>
  );
}
