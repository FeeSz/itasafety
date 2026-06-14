import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return FEATURED_PRODUCTS.filter((p) =>
      [p.name, p.category, p.sku, p.description]
        .join(" ")
        .toLowerCase()
        .includes(term),
    ).slice(0, 6);
  }, [term]);

  const inputCls =
    size === "sm"
      ? "h-10 text-[14px]"
      : "h-11 text-[15px]";

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 ${inputCls}`}>
        <Search className="size-4 shrink-0 text-[#9CA3AF]" />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder={placeholder}
          aria-label="Buscar produtos"
          className="flex-1 bg-transparent text-[#111] placeholder:text-[#9CA3AF] outline-none"
        />
      </div>

      {term.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-[13px] text-[#6B7280]">
              Nenhum item relacionado a <span className="font-semibold text-[#111]">"{q}"</span> foi encontrado no catálogo.
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
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F9FAFB]"
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="size-11 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#111]">
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
