import { useMemo, useState } from "react";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { FEATURED_PRODUCTS } from "@/lib/products";

type Tab = "todos" | "mais-vendido" | "novo" | "certificado";

const TABS: { id: Tab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "mais-vendido", label: "Mais procurados" },
  { id: "novo", label: "Novidades" },
  { id: "certificado", label: "Com CA" },
];

export default function FeaturedProducts() {
  const [tab, setTab] = useState<Tab>("todos");
  const products = useMemo(
    () =>
      tab === "todos"
        ? FEATURED_PRODUCTS
        : FEATURED_PRODUCTS.filter((product) => product.tags?.includes(tab)),
    [tab],
  );

  return (
    <div>
      <div
        className="mb-8 flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_1px_8px_rgba(15,23,42,0.05)] sm:w-fit"
        role="group"
        aria-label="Filtrar produtos em destaque"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTab(item.id)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                selected ? "bg-slate-950 text-white" : "text-ink-muted hover:bg-[#f5f5f7] hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <CatalogProductCard key={product.sku} product={product} />
        ))}
      </div>
    </div>
  );
}
