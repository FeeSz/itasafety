import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";

import {
  Menu,
  Search,
  ShoppingCart,
  X,
  Phone,
  Mail,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import SearchBox from "./SearchBox";
import { CATEGORIES } from "@/lib/categories";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WHATSAPP_URL = "https://wa.me/5511988776655";

const NAV_LINKS: { label: string; to: string; hasMenu?: boolean }[] = [
  { label: "Produtos", to: "/categorias", hasMenu: true },
  { label: "Categorias", to: "/categorias" },
  { label: "Quem Somos", to: "/quemsomos" },
  { label: "Localização", to: "/localizacao" },
  { label: "Contato", to: "/contato" },
];

const getFirstName = (email?: string, fullName?: string) => {
  if (fullName) {
    const first = fullName.trim().split(/\s+/)[0];
    if (first) return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  if (!email) return "Usuário";
  const username = email.split("@")[0].toLowerCase();
  if (username.includes("felype")) return "Felype";
  const cleanPart = username.split(/[^a-zA-Z]/)[0];
  if (cleanPart) {
    if (cleanPart.startsWith("felypelopes")) return "Felype";
    return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1).toLowerCase();
  }
  return "Usuário";
};

export default function Header() {
  const { user, isAdmin, loading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useQuoteCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const firstName = getFirstName(user?.email, fullName);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer || mega ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer, mega]);

  const showWhite = !isHome || scrolled;
  return (
    <header
      className={`left-0 right-0 top-0 z-50 ${
        isHome ? "absolute" : "sticky"
      } ${showWhite ? "header-scrolled" : "header-transparent"}`}
      style={{ height: "clamp(64px, 10vw, 136px)" }}
    >
      <div
        className="mx-auto flex max-w-7xl items-center px-5 md:px-10"
        style={{ height: "clamp(64px, 10vw, 136px)" }}
      >
        {/* Left — Logo proporcional a cada tela */}
        <div className="flex shrink-0 items-center">
          <Logo />
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
            className="hidden text-[#374151] transition-all duration-150 hover:text-[#111111] hover:scale-105 active:scale-90 md:block"
          >
            <Search className="size-[22px]" />
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative text-[#374151] transition-all duration-150 hover:text-[#111111] hover:scale-105 active:scale-90"
              aria-label={`Carrinho de cotação (${count} itens)`}
            >
              <ShoppingCart className="size-[22px]" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-red px-1 text-[11px] font-bold leading-none text-white">
                  {count}
                </span>
              )}
            </button>
          )}
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-hairline bg-white/50 px-3 py-1.5 transition-all hover:bg-slate-50 hover:shadow-sm"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className="size-7 rounded-full object-cover border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                    <User className="size-4" />
                  </div>
                )}
                <span className="hidden md:inline text-sm font-semibold text-[#111111]">
                  Olá, {firstName}
                </span>
                <ChevronDown
                  className={`size-3.5 text-slate-500 transition-transform duration-200 hidden md:block ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-hairline bg-white py-1.5 shadow-lg z-50 animate-slide-down animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="border-b border-hairline px-4 py-2 mb-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                      Sua Conta
                    </p>
                    <p className="text-xs font-bold text-ink truncate mt-0.5">
                      {fullName || `Olá, ${firstName}`}
                    </p>
                    <p className="text-[10px] text-ink-muted truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="size-4 text-brand-blue" />
                      Painel do Administrador
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await supabase.auth.signOut();
                      toast.success("Sessão encerrada");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-red hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <Link
              to="/auth"
              className="hidden rounded-full border border-[#111111] px-5 py-2 text-[14px] font-semibold text-[#111111] transition-all duration-150 hover:bg-[#111111] hover:text-white hover:scale-105 active:scale-95 md:block"
            >
              Entrar
            </Link>
          ) : (
            <div className="hidden h-[38px] w-[80px] md:block bg-slate-50 border border-slate-100 rounded-full animate-pulse" />
          )}
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="grid size-11 place-items-center text-[#111111] md:hidden transition-all duration-150 hover:scale-105 active:scale-90"
            aria-label="Abrir menu"
          >
            <Menu className="size-7" />
          </button>
        </div>
      </div>

      {/* Search overlay (desktop) */}
      {searchOpen && (
        <div
          className="absolute left-0 right-0 hidden border-t border-[#F3F4F6] bg-white px-10 py-3 shadow-sm md:block animate-slide-down"
          style={{ top: "clamp(64px, 10vw, 136px)" }}
        >
          <div className="mx-auto max-w-3xl">
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
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
          <div className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-hairline bg-white p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="grid size-10 place-items-center text-[#111] transition-all duration-150 hover:scale-110 active:scale-90"
                aria-label="Fechar"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="border-b border-hairline bg-white px-4 py-3">
              <SearchBox size="sm" onNavigate={() => setDrawer(false)} />
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
                <li>
                  <Link
                    to="/quemsomos"
                    onClick={() => setDrawer(false)}
                    className="block py-2 text-ink"
                  >
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/localizacao"
                    onClick={() => setDrawer(false)}
                    className="block py-2 text-ink"
                  >
                    Localização
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contato"
                    onClick={() => setDrawer(false)}
                    className="block py-2 text-ink"
                  >
                    Contato
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      to="/carrinho"
                      onClick={() => setDrawer(false)}
                      className="block py-2 text-ink"
                    >
                      Lista de Cotação
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Sticky CTA: Entrar ou Perfil no Mobile Drawer */}
            <div className="border-t border-hairline bg-white p-4">
              {user ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={firstName}
                        className="size-11 rounded-full object-cover border border-hairline"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-hairline">
                        <User className="size-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">Olá, {firstName}</p>
                      <p className="text-xs text-ink-muted truncate">{user.email}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDrawer(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#111111] py-2.5 text-center text-[14px] font-semibold text-[#111111] hover:bg-slate-50 transition-colors mb-2"
                    >
                      <LayoutDashboard className="size-4" />
                      Painel Administrador
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      setDrawer(false);
                      await supabase.auth.signOut();
                      toast.success("Sessão encerrada");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-red py-2.5 text-center text-[14px] font-bold text-white hover:bg-red-600 transition-colors"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setDrawer(false)}
                  className="block w-full rounded-full bg-[#111111] py-3 text-center text-[14px] font-bold text-white transition-colors hover:bg-[#374151]"
                >
                  Entrar / Cadastrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
