import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Menu,
  Search,
  ShoppingCart,
  X,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import SearchBox from "./SearchBox";
import { CATEGORIES } from "@/lib/categories";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";

const WHATSAPP_URL = "https://wa.me/5511988776655";

const NAV_LINKS: { label: string; to: string; hasMenu?: boolean }[] = [
  { label: "Produtos", to: "/categorias", hasMenu: true },
  { label: "Categorias", to: "/categorias" },
  { label: "Quem Somos", to: "/quemsomos" },
  { label: "Localização", to: "/localizacao" },
  { label: "Contato", to: "/contato" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useQuoteCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

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

  const showWhite = !isHome || scrolled;

  const showWhite = !isHome || scrolled;
  return (
    <header
      className={`left-0 right-0 top-0 z-50 h-20 ${
        isHome ? "absolute" : "sticky"
      } ${showWhite ? "header-scrolled" : "header-transparent"}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center px-5 md:px-10">
        {/* Left — Logo (evidence) */}
        <div className="flex shrink-0 items-center">
          <Logo className="!h-12 md:!h-14 lg:!h-16" />
        </div>

        {/* Center — Nav links (desktop) */}
        <nav className="ml-12 hidden flex-1 items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map((l) =>
            l.hasMenu ? (
              <button
                key={l.label}
                type="button"
                onClick={() => setMega(true)}
                className="text-[15px] font-semibold text-[#111111] transition-colors duration-150 hover:text-[#1B4F8A]"
              >
                {l.label} ↓
              </button>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="text-[15px] font-semibold text-[#111111] transition-colors duration-150 hover:text-[#1B4F8A]"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right zone */}
        <div className="ml-auto flex items-center gap-6">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Buscar"
            className="hidden text-[#374151] transition-colors hover:text-[#111111] md:block"
          >
            <Search className="size-[22px]" />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative text-[#374151] transition-colors hover:text-[#111111]"
            aria-label={`Carrinho de cotação (${count} itens)`}
          >
            <ShoppingCart className="size-[22px]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-red px-1 text-[11px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/auth"
            className="hidden rounded-full border border-[#111111] px-5 py-2 text-[14px] font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white md:block"
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="grid size-11 place-items-center text-[#111111] md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-7" />
          </button>
        </div>
      </div>

      {/* Search overlay (desktop) */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-20 hidden border-t border-[#F3F4F6] bg-white px-10 py-3 shadow-sm md:block animate-slide-down">
          <form onSubmit={onSearchSubmit} className="mx-auto flex max-w-3xl">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="O que você está procurando?"
              aria-label="Buscar produtos"
              className="flex-1 border-b border-[#111] bg-transparent px-2 py-2 text-sm text-[#111] placeholder:text-[#9CA3AF] outline-none"
            />
            <button
              type="submit"
              className="ml-3 rounded-md bg-[#111111] px-5 text-[13px] font-bold text-white hover:bg-[#374151]"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

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
          <div className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white animate-fade-in">
            <div className="flex items-center justify-between border-b border-hairline bg-white p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="grid size-10 place-items-center text-[#111]"
                aria-label="Fechar"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-px bg-hairline">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-white py-3 text-[11px] font-semibold text-ink"
              >
                <MessageCircle className="size-5 text-[#25D366]" />
                WhatsApp
              </a>
              <a
                href="tel:+551126267417"
                className="flex flex-col items-center gap-1 bg-white py-3 text-[11px] font-semibold text-ink"
              >
                <Phone className="size-5 text-brand-blue" />
                Ligar
              </a>
              <a
                href="mailto:contato@itasafety.com.br"
                className="flex flex-col items-center gap-1 bg-white py-3 text-[11px] font-semibold text-ink"
              >
                <Mail className="size-5 text-brand-blue" />
                E-mail
              </a>
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
                        className="flex min-h-11 items-center gap-3 py-3 text-sm font-medium text-ink"
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
