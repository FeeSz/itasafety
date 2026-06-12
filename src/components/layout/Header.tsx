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
  const [query, setQuery] = useState("");
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

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/departamento/${CATEGORIES[0].slug}?q=${encodeURIComponent(query)}`;
  };

  const transparent = isHome && !scrolled;
  return (
    <header
      className={`left-0 right-0 top-0 z-50 ${isHome ? "fixed" : "sticky"}`}
      style={
        transparent
          ? {
              background:
                "linear-gradient(to bottom, rgba(5,11,18,0.92), rgba(5,11,18,0.6), transparent)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }
          : {
              background: "#ffffff",
              boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
            }
      }
    >
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-8 px-6">
        <div className="flex shrink-0 items-center">
          <Logo className="!h-9 md:!h-10" onDark={transparent} />
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {NAV_LINKS.map((l) => {
            const baseColor = transparent ? "#A3B1C6" : "#374151";
            const hoverColor = transparent ? "#ffffff" : "#111111";
            const cls =
              "group relative pb-1 text-[14px] font-medium transition-colors duration-150";
            const underline = (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-200 group-hover:w-full"
                style={{ background: "linear-gradient(90deg, #1E88E5, #00C853)" }}
              />
            );
            return l.hasMenu ? (
              <button
                key={l.label}
                type="button"
                onClick={() => setMega(true)}
                className={cls}
                style={{ color: baseColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = baseColor)}
              >
                {l.label}
                {underline}
              </button>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className={cls}
                style={{ color: baseColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = baseColor)}
              >
                {l.label}
                {underline}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Buscar"
            className="hidden transition-colors md:block"
            style={{ color: transparent ? "#A3B1C6" : "#374151" }}
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative transition-colors"
            aria-label={`Carrinho de cotação (${count} itens)`}
            style={{ color: transparent ? "#A3B1C6" : "#374151" }}
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-[16px] py-[8px] text-[13px] font-medium md:inline-flex"
            style={{
              border: "1px solid rgba(163,177,198,0.5)",
              color: transparent ? "#f5f7fa" : "#111111",
              background: transparent ? "rgba(5,11,18,0.4)" : "transparent",
            }}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
          <Link
            to="/contato"
            className="hidden items-center gap-1.5 rounded-full px-[18px] py-[9px] text-[13px] font-semibold md:inline-flex"
            style={{
              background: "linear-gradient(135deg, #1E88E5, #00C853)",
              color: "#050b12",
              boxShadow: "0 10px 30px rgba(0, 200, 83, 0.25)",
            }}
          >
            Solicitar cotação
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="grid size-10 place-items-center md:hidden"
            style={{ color: transparent ? "#f5f7fa" : "#111111" }}
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/* Search overlay (desktop) */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-16 hidden border-t border-[#F3F4F6] bg-white px-10 py-3 shadow-sm md:block animate-slide-down">
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
