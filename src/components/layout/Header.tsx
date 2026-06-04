import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, User, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import AnnouncementBar from "./AnnouncementBar";
import MegaMenu from "./MegaMenu";
import { CATEGORIES } from "@/lib/categories";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";

const QUICK = ["calcados", "luvas", "capacetes", "protecao-visual", "vestimenta"];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const [query, setQuery] = useState("");
  const { count, setOpen: setCartOpen } = useQuoteCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer || mega ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer, mega]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/departamento/${CATEGORIES[0].slug}?q=${encodeURIComponent(query)}`;
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-card" : ""
      }`}
    >
      <AnnouncementBar />

      {/* Main header — light */}
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto flex min-h-[96px] max-w-7xl items-center gap-6 px-4 py-3 md:px-6 md:py-4">
          <Logo className="shrink-0" />

          {/* Search (desktop) */}
          <form
            onSubmit={onSearchSubmit}
            className="mx-2 hidden flex-1 md:flex"
            role="search"
          >
            <div className="flex w-full overflow-hidden rounded-md border-2 border-hairline bg-white transition-colors focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_rgba(27,79,138,0.12)]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="O que você está procurando?"
                aria-label="Buscar produtos"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="flex items-center justify-center bg-brand-blue px-4 text-white transition-colors hover:bg-brand-blue-hover"
              >
                <Search className="size-5" />
              </button>
            </div>
          </form>

          {/* Right zone */}
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <Link
              to="/auth"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand-blue md:flex"
            >
              <User className="size-5" />
              <span className="font-medium">Entrar ou Cadastrar</span>
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative grid size-11 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand-blue"
              aria-label={`Carrinho de cotação (${count} itens)`}
            >
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid size-11 place-items-center rounded-md text-ink-muted hover:bg-surface-sunken md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={onSearchSubmit} className="px-4 pb-3 md:hidden">
          <div className="flex overflow-hidden rounded-md border-2 border-hairline bg-white">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Buscar produtos..."
              aria-label="Buscar"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-brand-blue px-4 text-white"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Categories nav bar — accent strip */}
      <div className="hidden bg-brand-blue text-white md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-6 px-6">
          <button
            type="button"
            onClick={() => setMega(true)}
            className="flex items-center gap-2 rounded-sm bg-black/15 px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors hover:bg-black/30"
          >
            <Menu className="size-4" />
            Todas as Categorias
            <ChevronDown className="size-3.5" />
          </button>
          <ul className="flex items-center gap-1 text-[13px]">
            {QUICK.map((slug) => {
              const cat = CATEGORIES.find((c) => c.slug === slug);
              if (!cat) return null;
              return (
                <li key={slug}>
                  <Link
                    to="/departamento/$slug"
                    params={{ slug }}
                    className="block rounded px-3 py-1.5 font-medium text-white/95 transition-colors hover:bg-white/10"
                  >
                    {cat.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <MegaMenu open={mega} onClose={() => setMega(false)} />

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60 animate-fade-in"
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white animate-fade-in">
            <div className="flex items-center justify-between border-b border-hairline bg-white p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="grid size-10 place-items-center text-ink-muted"
                aria-label="Fechar"
              >
                <X className="size-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                Categorias
              </p>
              <ul className="divide-y divide-hairline">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <li key={cat.slug}>
                      <Link
                        to="/departamento/$slug"
                        params={{ slug: cat.slug }}
                        onClick={() => setDrawer(false)}
                        className="flex items-center gap-3 py-3 text-sm font-medium text-ink"
                      >
                        <Icon className="size-5 text-brand-blue" />
                        {cat.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                Institucional
              </p>
              <ul className="space-y-1 text-sm">
                <li><Link to="/quemsomos" onClick={() => setDrawer(false)} className="block py-2 text-ink">Quem Somos</Link></li>
                <li><Link to="/localizacao" onClick={() => setDrawer(false)} className="block py-2 text-ink">Localização</Link></li>
                <li><Link to="/contato" onClick={() => setDrawer(false)} className="block py-2 text-ink">Contato</Link></li>
                <li><Link to="/carrinho" onClick={() => setDrawer(false)} className="block py-2 text-ink">Lista de Cotação</Link></li>
                <li><Link to="/auth" onClick={() => setDrawer(false)} className="block py-2 text-brand-blue font-semibold">Entrar / Cadastrar</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
