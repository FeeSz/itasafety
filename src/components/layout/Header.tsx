import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import Container from "@/components/ui/Container";
import CtaButton from "@/components/ui/CtaButton";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categorias", label: "Categorias" },
  { to: "/sobre", label: "A Empresa" },
  { to: "/contato", label: "Contato" },
] as const;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-white/95 shadow-card backdrop-blur-md"
          : "border-b border-transparent bg-white"
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden border-b border-hairline bg-surface-sunken md:block">
        <Container className="flex h-9 items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          <span>Atendimento corporativo · Seg a Sex · 08h – 18h</span>
          <div className="flex items-center gap-6">
            <a href="mailto:contato@itasafety.com.br" className="hover:text-brand-red">
              contato@itasafety.com.br
            </a>
            <span className="h-3 w-px bg-hairline" />
            <a href="tel:+551126267417" className="hover:text-brand-red">
              +55 (11) 2626-7417
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Logo />
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8 font-display text-[13px] font-semibold uppercase tracking-wide text-ink">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="relative py-2 transition-colors hover:text-brand-red [&.active]:text-brand-red"
                    activeProps={{ className: "active" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:+551126267417"
            className="hidden items-center gap-2.5 xl:flex"
          >
            <span className="grid size-9 place-items-center rounded-sm bg-brand-red/10 text-brand-red">
              <Phone className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Central de Vendas
              </span>
              <span className="block text-sm font-bold text-ink">
                +55 (11) 2626-7417
              </span>
            </span>
          </a>
          <CtaButton
            as={Link}
            to="/contato"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Orçamento
          </CtaButton>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center text-ink lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </Container>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-navy-deep/60 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center text-ink"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <nav className="mt-12" aria-label="Navegação móvel">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block border-b border-hairline py-4 font-display text-2xl font-bold uppercase tracking-tight text-ink hover:text-brand-red"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto space-y-4">
              <CtaButton
                as={Link}
                to="/contato"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Solicitar Orçamento
              </CtaButton>
              <a
                href="tel:+551126267417"
                className="block text-center font-mono text-sm text-ink-muted"
              >
                +55 (11) 2626-7417
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
