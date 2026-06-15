import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { FEATURED_PRODUCTS } from "@/lib/products";

type Props = {
  autoFocus?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
  size?: "sm" | "md";
};

export default function SearchBox({
  autoFocus = false,
  onNavigate,
  placeholder = "O que você está procurando?",
  size = "md",
}: Props) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(autoFocus);
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return FEATURED_PRODUCTS.filter((p) =>
      [p.name, p.category, p.sku, p.description].join(" ").toLowerCase().includes(term),
    ).slice(0, 6);
  }, [term]);

  const inputCls = size === "sm" ? "h-10 text-[14px]" : "h-11 text-[15px]";

  return (
    <div className="relative w-full">
      <div
        className={`group flex items-center gap-2 rounded-full border bg-white px-3 shadow-sm transition-all duration-300 ${inputCls} ${
          focused || term
            ? "border-brand-blue/60 shadow-[0_10px_26px_rgba(27,79,138,0.14)] ring-4 ring-brand-blue/10"
            : "border-[#D8DEE6] hover:border-brand-blue/35 hover:shadow-[0_8px_18px_rgba(27,79,138,0.08)]"
        }`}
      >
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full transition-all duration-300 ${
            focused || term
              ? "bg-brand-blue-tint text-brand-blue"
              : "bg-surface-sunken text-[#6B7280] group-hover:text-brand-blue"
          }`}
        >
          <Search className="size-4" />
        </span>
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type="search"
          placeholder={placeholder}
          aria-label="Buscar produtos"
          className="min-w-0 flex-1 bg-transparent text-[#111] placeholder:text-[#6B7280] outline-none"
        />
        {q.length > 0 && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQ("")}
            aria-label="Limpar busca"
            className="grid size-7 shrink-0 place-items-center rounded-full text-[#6B7280] transition-all duration-200 hover:bg-surface-sunken hover:text-[#111]"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {term.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-xl border border-[#D8DEE6] bg-white shadow-[0_18px_44px_rgba(27,79,138,0.18)] animate-search-results">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
              Nenhum item relacionado a <span className="font-semibold text-[#111]">"{q}"</span> foi
              encontrado no catálogo.
            </p>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {results.map((p) => (
                <li key={p.sku}>
                  <Link
                    to="/detalhes/$sku"
                    params={{ sku: p.sku }}
                    onClick={() => {
                      setQ("");
                      onNavigate?.();
                    }}
                    className="group/result flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-brand-blue-tint"
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="size-11 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#111] transition-colors group-hover/result:text-brand-blue">
                        {p.name}
                      </p>
                      <p className="truncate text-[11px] text-[#6B7280]">
                        {p.category} · CA {p.ca}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
