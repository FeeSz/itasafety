import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/hooks/use-quote-cart";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export default function CatalogProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useQuoteCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleAdd = () => {
    add(product, 1);
    setAdded(true);
    toast.success("Produto adicionado à lista", { description: product.name });
  };

  return (
    <article
      className={cn(
        "motion-control group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-subtle hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated",
        className,
      )}
    >
      <Link
        to="/detalhes/$sku"
        params={{ sku: product.sku }}
        aria-label={`Ver detalhes de ${product.name}`}
        className="focus-ring relative block aspect-square overflow-hidden bg-surface p-5"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="motion-transform size-full object-contain mix-blend-multiply group-hover:scale-[1.025]"
        />
        <Badge
          variant="outline"
          className="absolute left-3 top-3 bg-surface/95 font-mono text-data"
          title="Número de CA informado no cadastro local"
        >
          CA informado {product.ca}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col border-t border-border p-4 sm:p-5">
        <p className="text-caption font-semibold text-primary">{product.category}</p>
        <Link
          to="/detalhes/$sku"
          params={{ sku: product.sku }}
          className="focus-ring mt-2 rounded-sm"
        >
          <h3 className="motion-colors line-clamp-2 min-h-11 text-title font-semibold text-foreground hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-body-sm text-foreground-muted">
          {product.description}
        </p>
        <p className="mt-3 font-mono text-data text-foreground-subtle">Ref. {product.sku}</p>

        <Button
          type="button"
          onClick={handleAdd}
          size="default"
          className={cn("mt-5 w-full", added && "bg-success text-white hover:bg-success")}
        >
          {added ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          <span aria-live="polite">{added ? "Adicionado" : "Adicionar à lista"}</span>
        </Button>
      </div>
    </article>
  );
}
