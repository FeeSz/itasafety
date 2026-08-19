import { Link } from "@tanstack/react-router";
import { ImageOff, ShoppingCart, Trash2 } from "lucide-react";
import { useQuoteCart } from "@/hooks/use-quote-cart";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button.variants";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function QuoteFab() {
  const { items, count, remove, setQty, open, setOpen } = useQuoteCart();

  if (count === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          aria-label={`Abrir lista de cotação com ${count} unidades`}
          size="icon"
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 size-14 rounded-full shadow-overlay hover:-translate-y-0.5"
        >
          <ShoppingCart className="size-6" aria-hidden />
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-brand-accent px-1.5 text-caption font-bold ring-2 ring-surface">
            {count > 99 ? "99+" : count}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-dvh w-full max-w-md flex-col gap-0 border-border bg-surface p-0"
      >
        <SheetHeader className="border-b border-white/10 bg-surface-inverse px-5 pb-5 pt-5 text-left text-white">
          <SheetDescription className="text-caption font-semibold text-white/70">
            Minha lista
          </SheetDescription>
          <SheetTitle className="text-lg font-bold text-white">Lista de cotação</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.sku}
                className="flex gap-3 rounded-lg border border-border bg-surface p-3"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 shrink-0 rounded-md bg-surface-muted object-contain"
                  />
                ) : (
                  <span className="grid size-16 shrink-0 place-items-center rounded-md bg-surface-muted text-foreground-subtle">
                    <ImageOff className="size-5" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-primary">{item.category}</p>
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={9999}
                      value={item.qty}
                      onChange={(event) => setQty(item.sku, Number(event.target.value) || 1)}
                      aria-label={`Quantidade de ${item.name}`}
                      className="h-10 w-20 px-2 text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => remove(item.sku)}
                      aria-label={`Remover ${item.name}`}
                      variant="ghost"
                      size="icon-sm"
                      className="ml-auto text-danger hover:bg-danger-muted hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-border p-5">
          <SheetClose asChild>
            <Link to="/carrinho" className={buttonVariants({ size: "lg", className: "w-full" })}>
              Revisar lista
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Button type="button" variant="outline" size="lg" className="w-full">
              Continuar explorando
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
