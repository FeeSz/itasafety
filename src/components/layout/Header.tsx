import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import Container from "@/components/ui/Container";
import CtaButton from "@/components/ui/CtaButton";

const NAV = [
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
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-brand-navy-deep/85 backdrop-blur-md"
          : "border-transparent bg-brand-navy-deep"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Logo />
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="relative py-2 transition-colors hover:text-brand-red [&.active]:text-white"
                    activeProps={{ className: "active" }}
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
            className="hidden items-center gap-2 text-right xl:flex"
          >
            <Phone className="size-4 text-brand-red" aria-hidden />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-tighter text-white/40">
                Central de Vendas
              </span>
              <span className="block text-sm font-bold text-white">
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
            Solicitar Orçamento
          </CtaButton>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center text-white lg:hidden"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-brand-navy-deep p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center text-white"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <nav className="mt-12" aria-label="Navegação móvel">
              <ul className="space-y-2">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block py-4 font-display text-2xl font-bold uppercase tracking-tighter text-white hover:text-brand-red"
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
                className="block text-center font-mono text-sm text-white/70"
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
