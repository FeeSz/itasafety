import { Link } from "@tanstack/react-router";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { useQuoteCart } from "./QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function QuoteFab() {
  const { user, loading } = useAuth();
  const { items, count, remove, setQty, open, setOpen } = useQuoteCart();

  if (loading || !user) return null;

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Abrir lista de cotação (${count} itens)`}
        className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-brand-blue text-white shadow-strong transition-all hover:bg-brand-blue-hover hover:scale-105"
      >
        <ShoppingCart className="size-6" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-brand-red px-1.5 text-xs font-bold">
            {count}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 animate-fade-in"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-strong animate-fade-in">
            <header className="flex items-center justify-between border-b border-hairline bg-header-dark p-5 text-white">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">Minha lista</p>
                <h2 className="text-lg font-bold">Lista de Cotação</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="grid size-9 place-items-center rounded-md text-white hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingCart className="size-12 text-ink-soft" />
                  <p className="mt-4 font-semibold text-ink">Sua lista está vazia</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Adicione produtos para solicitar uma cotação personalizada.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => (
                    <li key={i.sku} className="flex gap-3 rounded-md border border-hairline p-3">
                      <img
                        src={i.image}
                        alt=""
                        className="size-16 shrink-0 rounded-sm bg-surface-sunken object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-brand-blue-light">
                          {i.category}
                        </p>
                        <p className="text-sm font-semibold text-ink line-clamp-2">{i.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={i.qty}
                            onChange={(e) => setQty(i.sku, parseInt(e.target.value || "1", 10))}
                            aria-label="Quantidade"
                            className="w-16 rounded-sm border border-hairline px-2 py-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => remove(i.sku)}
                            aria-label="Remover"
                            className="ml-auto grid size-8 place-items-center rounded-md text-ink-soft hover:bg-red-50 hover:text-brand-red"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="space-y-2 border-t border-hairline p-5">
              <Link
                to="/carrinho"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md bg-brand-blue py-3 text-center text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover"
              >
                Solicitar Cotação
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md border border-hairline py-3 text-center text-sm font-semibold text-ink hover:bg-surface-sunken"
              >
                Continuar Comprando
              </button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
