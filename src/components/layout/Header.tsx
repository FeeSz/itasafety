import { Link, useRouter } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Logo from "./Logo";
import Container from "@/components/ui/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQuoteCart } from "@/hooks/use-quote-cart";

const navLinkClass =
  "focus-ring motion-colors inline-flex min-h-11 items-center rounded-md px-3 text-body-sm font-medium text-foreground-muted hover:bg-accent hover:text-accent-foreground";

function firstNameFrom(email?: string, fullName?: string) {
  const candidate = fullName?.trim().split(/\s+/)[0] || email?.split("@")[0];
  if (!candidate) return "Conta";
  return candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
}

export default function Header() {
  const pathname = useRouter().state.location.pathname;
  const { user, isAdmin, loading } = useAuth();
  const { count } = useQuoteCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name
        : undefined;
  const firstName = firstNameFrom(user?.email, fullName);

  if (pathname === "/") {
    return <LandingHeader />;
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Não foi possível encerrar a sessão. Tente novamente.");
      return;
    }
    toast.success("Sessão encerrada");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center gap-2 sm:gap-3">
        <Logo />

        <nav
          className="ml-4 hidden flex-1 items-center gap-1 lg:flex"
          aria-label="Navegação principal"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={navLinkClass}>
                Explorar
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="px-3 text-caption font-semibold text-foreground-subtle">
                Produtos
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer p-0">
                <Link to="/catalogo" className="w-full px-3 py-2.5">
                  <span className="block font-semibold text-foreground">Catálogo</span>
                  <span className="mt-0.5 block text-caption text-foreground-muted">
                    Buscar, descobrir e selecionar produtos
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer p-0">
                <Link to="/categorias" className="w-full px-3 py-2.5">
                  <span className="block font-semibold text-foreground">Categorias</span>
                  <span className="mt-0.5 block text-caption text-foreground-muted">
                    Ver o índice completo
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={navLinkClass}>
                Empresa
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem asChild className="cursor-pointer p-0">
                <Link to="/sobre" className="w-full px-3 py-2.5 font-semibold">
                  Sobre
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer p-0">
                <Link to="/contato" className="w-full px-3 py-2.5 font-semibold">
                  Contato
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/catalogo"
            aria-label="Buscar no catálogo"
            className="focus-ring motion-colors hidden size-11 items-center justify-center rounded-md text-foreground-muted hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          >
            <Search className="size-5" aria-hidden />
          </Link>

          <Link
            to="/carrinho"
            aria-label={count > 0 ? `Lista de cotação com ${count} unidades` : "Lista de cotação"}
            className="focus-ring motion-surface relative inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-label font-semibold text-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground sm:px-4"
          >
            <ShoppingCart className="size-5" aria-hidden />
            <span className="hidden sm:inline">Cotação</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-caption font-bold text-white ring-2 ring-surface">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu da conta"
                  className="focus-ring motion-surface hidden min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-label font-semibold text-foreground hover:bg-accent lg:inline-flex"
                >
                  <User className="size-4 text-brand-blue" aria-hidden />
                  {firstName}
                  <ChevronDown className="size-4 text-ink-soft" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <AccountMenu
                email={user.email}
                fullName={fullName}
                isAdmin={isAdmin}
                onSignOut={signOut}
              />
            </DropdownMenu>
          ) : !loading ? (
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="focus-ring motion-colors hidden min-h-11 items-center rounded-md bg-primary px-5 text-label font-semibold text-white hover:bg-primary-hover lg:inline-flex"
            >
              Entrar
            </Link>
          ) : (
            <span className="skeleton hidden h-11 w-24 rounded-md lg:block" aria-hidden />
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="focus-ring motion-colors inline-grid size-11 place-items-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
              >
                <Menu className="size-6" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full max-w-sm flex-col gap-0 border-border bg-surface p-0"
            >
              <SheetHeader className="border-b border-border px-6 pb-5 pt-6 text-left">
                <SheetTitle>Navegação</SheetTitle>
                <SheetDescription>Explore a ItaSafety e acesse sua lista.</SheetDescription>
              </SheetHeader>

              <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Navegação móvel">
                <MobileSection title="Explorar">
                  <MobileLink to="/catalogo" onNavigate={() => setMobileOpen(false)}>
                    Catálogo
                  </MobileLink>
                  <MobileLink to="/categorias" onNavigate={() => setMobileOpen(false)}>
                    Categorias
                  </MobileLink>
                </MobileSection>
                <MobileSection title="Empresa">
                  <MobileLink to="/sobre" onNavigate={() => setMobileOpen(false)}>
                    Sobre
                  </MobileLink>
                  <MobileLink to="/contato" onNavigate={() => setMobileOpen(false)}>
                    Contato
                  </MobileLink>
                </MobileSection>
                <MobileSection title="Utilidades">
                  <MobileLink to="/catalogo" onNavigate={() => setMobileOpen(false)}>
                    Buscar produtos
                  </MobileLink>
                  <MobileLink to="/carrinho" onNavigate={() => setMobileOpen(false)}>
                    Lista de cotação{count > 0 ? ` (${count})` : ""}
                  </MobileLink>
                  {user && (
                    <MobileLink to="/minhas-cotacoes" onNavigate={() => setMobileOpen(false)}>
                      Minhas cotações
                    </MobileLink>
                  )}
                </MobileSection>
              </nav>

              <div className="border-t border-border p-4">
                {user ? (
                  <div className="space-y-2">
                    <p className="px-2 text-body-sm font-semibold text-foreground">
                      {fullName || firstName}
                    </p>
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link
                          to="/admin"
                          className="focus-ring motion-colors flex min-h-11 items-center gap-2 rounded-md px-3 text-body-sm font-semibold text-foreground hover:bg-accent"
                        >
                          <LayoutDashboard className="size-4 text-brand-blue" aria-hidden />
                          Painel administrativo
                        </Link>
                      </SheetClose>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        void signOut();
                      }}
                      className="focus-ring motion-colors flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-body-sm font-semibold text-danger hover:bg-danger-muted"
                    >
                      <LogOut className="size-4" aria-hidden />
                      Sair
                    </button>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/auth"
                      search={{ mode: "login" }}
                      className="focus-ring motion-colors inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-body-sm font-semibold text-white hover:bg-primary-hover"
                    >
                      Entrar ou criar conta
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}

const landingNavLinkClass =
  "landing-anchor focus-ring inline-flex min-h-11 items-center rounded-sm px-2 text-[11px] font-semibold text-foreground-muted hover:text-foreground sm:px-3 sm:text-body-sm";

function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center px-4 sm:px-7 lg:px-8">
        <Logo imageClassName="h-12 origin-center scale-[1.18] sm:h-14 sm:scale-[1.15]" />
        <nav
          className="ml-3 flex items-center gap-0 sm:ml-7 sm:gap-1 lg:ml-12"
          aria-label="Navegação da página"
        >
          <a href="#inicio" className={landingNavLinkClass}>
            Início
          </a>
          <a href="#motivos" className={landingNavLinkClass}>
            Motivos
          </a>
          <a href="#perguntas" className={landingNavLinkClass}>
            Perguntas
          </a>
        </nav>
      </div>
    </header>
  );
}

function AccountMenu({
  email,
  fullName,
  isAdmin,
  onSignOut,
}: {
  email?: string;
  fullName?: string;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}) {
  return (
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel className="px-3 py-2">
        <span className="block text-body-sm text-foreground">{fullName || "Sua conta"}</span>
        {email && (
          <span className="mt-0.5 block truncate text-caption font-normal text-foreground-muted">
            {email}
          </span>
        )}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <AccountLink to="/minhas-cotacoes" icon={ClipboardList} label="Minhas cotações" />
      <AccountLink to="/perfil" icon={Building2} label="Meu perfil" />
      <AccountLink to="/configuracoes" icon={Settings} label="Configurações" />
      {isAdmin && <AccountLink to="/admin" icon={LayoutDashboard} label="Painel administrativo" />}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => void onSignOut()}
        className="min-h-10 cursor-pointer px-3 font-semibold text-danger focus:bg-danger-muted focus:text-danger"
      >
        <LogOut className="size-4" aria-hidden />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function AccountLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/minhas-cotacoes" | "/perfil" | "/configuracoes" | "/admin";
  icon: typeof User;
  label: string;
}) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer p-0">
      <Link to={to} className="flex min-h-10 w-full items-center gap-2 px-3 font-semibold">
        <Icon className="size-4 text-brand-blue" aria-hidden />
        {label}
      </Link>
    </DropdownMenuItem>
  );
}

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6" aria-labelledby={`mobile-${title.toLowerCase()}`}>
      <h2
        id={`mobile-${title.toLowerCase()}`}
        className="px-3 text-caption font-semibold text-primary"
      >
        {title}
      </h2>
      <div className="mt-2 grid">{children}</div>
    </section>
  );
}

function MobileLink({
  to,
  onNavigate,
  children,
}: {
  to: "/catalogo" | "/categorias" | "/sobre" | "/contato" | "/carrinho" | "/minhas-cotacoes";
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        onClick={onNavigate}
        className="focus-ring motion-colors flex min-h-12 items-center rounded-md px-3 text-body font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        {children}
      </Link>
    </SheetClose>
  );
}
