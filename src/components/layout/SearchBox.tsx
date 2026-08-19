import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { productMatchesCatalogQuery } from "@/lib/catalog-search";
import { LOCAL_CATALOG_PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";

type Props = {
  autoFocus?: boolean;
  className?: string;
  id?: string;
  onDismiss?: () => void;
  onNavigate?: () => void;
  placeholder?: string;
  size?: "sm" | "md";
};

export default function SearchBox({
  autoFocus = false,
  className,
  id = "catalog-search",
  onDismiss,
  onNavigate,
  placeholder = "Buscar por produto, categoria ou CA",
  size = "md",
}: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const term = query.trim();

  const matchingProducts = useMemo(() => {
    if (!term) return [];
    return LOCAL_CATALOG_PRODUCTS.filter((product) => productMatchesCatalogQuery(product, term));
  }, [term]);

  const suggestions = matchingProducts.slice(0, 6);
  const resultsId = `${id}-suggestions`;
  const inputHeight = size === "sm" ? "h-10 text-[14px]" : "h-11 text-[15px]";

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/catalogo",
      search: term ? { q: term } : {},
    });
    onNavigate?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    if (query) {
      setQuery("");
      return;
    }
    onDismiss?.();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={submitSearch}
        className={cn(
          "group flex items-center rounded-lg border border-border-strong bg-surface shadow-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
          inputHeight,
        )}
      >
        <button
          type="submit"
          aria-label="Buscar no catálogo"
          className="focus-ring motion-colors grid size-10 shrink-0 place-items-center rounded-md text-foreground-muted hover:text-primary"
        >
          <Search className="size-4" aria-hidden />
        </button>
        <label htmlFor={id} className="sr-only">
          Buscar produtos
        </label>
        <input
          id={id}
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          type="search"
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={resultsId}
          aria-expanded={term.length > 0}
          className="min-w-0 flex-1 bg-transparent pr-1 text-foreground outline-none placeholder:text-foreground-subtle [&::-webkit-search-cancel-button]:appearance-none"
        />
        {(query || onDismiss) && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (query) setQuery("");
              else onDismiss?.();
            }}
            aria-label={query ? "Limpar busca" : "Fechar busca"}
            className="focus-ring motion-colors mr-1 grid size-9 shrink-0 place-items-center rounded-md text-foreground-muted hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      {term.length > 0 && (
        <div
          id={resultsId}
          role="region"
          aria-label="Sugestões de busca"
          className="animate-search-results absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(31rem,70vh)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-2 shadow-elevated"
        >
          {suggestions.length === 0 ? (
            <p className="px-3 py-5 text-center text-body-sm text-foreground-muted">
              Nenhum produto encontrado para{" "}
              <span className="font-semibold text-foreground">“{query}”</span>.
            </p>
          ) : (
            <>
              <p className="px-3 pb-2 pt-1 text-caption font-semibold text-foreground-subtle">
                Sugestões
              </p>
              <ul className="grid min-w-0 gap-1">
                {suggestions.map((product) => (
                  <li key={product.sku} className="min-w-0">
                    <Link
                      to="/detalhes/$sku"
                      params={{ sku: product.sku }}
                      onClick={() => {
                        setQuery("");
                        onNavigate?.();
                      }}
                      className="focus-ring group/result flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent"
                    >
                      <img
                        src={product.image ?? undefined}
                        alt=""
                        className="size-12 shrink-0 rounded-md bg-surface-muted object-contain"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-semibold text-foreground group-hover/result:text-primary">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-foreground-muted">
                          {product.category}
                          {product.ca ? ` · CA ${product.ca}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/catalogo"
                search={{ q: term }}
                onClick={() => {
                  setQuery("");
                  onNavigate?.();
                }}
                className="focus-ring motion-colors mt-2 flex min-h-11 items-center justify-center rounded-lg border-t border-border px-3 pt-2 text-label font-semibold text-primary hover:text-primary-hover"
              >
                Ver {matchingProducts.length}{" "}
                {matchingProducts.length === 1 ? "resultado" : "resultados"}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
