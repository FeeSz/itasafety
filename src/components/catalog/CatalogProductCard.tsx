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
    toast.success("Produto adicionado à cotação", { description: product.name });
  };

  return (
    <article
      className={cn(
        "motion-control group flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-surface hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-subtle",
        className,
      )}
    >
      <Link
        to="/detalhes/$sku"
        params={{ sku: product.sku }}
        aria-label={`Ver detalhes de ${product.name}`}
        className="focus-ring relative block aspect-square overflow-hidden bg-surface-muted/70 p-5"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="motion-transform size-full object-contain mix-blend-multiply group-hover:scale-[1.025]"
          />
        ) : (
          <span className="flex size-full items-center justify-center px-8 text-center text-title font-semibold text-foreground-muted">
            {product.category}
          </span>
        )}
        {product.ca ? (
          <Badge
            variant="outline"
            className="absolute left-3 top-3 bg-surface/95 font-mono text-data shadow-subtle"
            title="CA informado no catálogo público legado"
          >
            CA {product.ca}
          </Badge>
        ) : null}
        {product.imageNote ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-surface/92 px-2.5 py-1 text-data font-medium text-foreground-muted shadow-subtle">
            Imagem ilustrativa
          </span>
        ) : null}
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
        <p className="mb-5 mt-3 font-mono text-data text-foreground-subtle">Cód. {product.sku}</p>

        <Button
          type="button"
          onClick={handleAdd}
          size="default"
          className={cn("mt-auto w-full", added && "bg-success text-white hover:bg-success")}
        >
          {added ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          <span aria-live="polite">{added ? "Na cotação" : "Adicionar à cotação"}</span>
        </Button>
      </div>
    </article>
  );
}
