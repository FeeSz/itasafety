import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import Container from "@/components/ui/Container";

const FOOTER_SECTIONS = [
  {
    heading: "Categorias",
    links: [
      { label: "Proteção Cabeça", to: "/categorias" },
      { label: "Proteção Visual", to: "/categorias" },
      { label: "Proteção Respiratória", to: "/categorias" },
      { label: "Trabalho em Altura", to: "/categorias" },
      { label: "Calçados de Segurança", to: "/categorias" },
    ],
  },
  {
    heading: "Empresa",
    links: [
      { label: "Quem Somos", to: "/sobre" },
      { label: "Fale Conosco", to: "/contato" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Política de Privacidade", to: "/privacidade" },
      { label: "Termos de Uso", to: "/termos" },
      { label: "Política de Cookies", to: "/cookies" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-brand-red bg-brand-navy-deep pb-10 pt-20 text-white/80">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo onDark />
            <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-white/60">
              Distribuição enterprise de equipamentos de proteção individual e
              consultoria técnica para indústrias brasileiras desde 1998.
              Comprometidos com a vida e a conformidade normativa.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden />
                <a href="tel:+551126267417" className="hover:text-white">
                  +55 (11) 2626-7417
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden />
                <a href="mailto:contato@itasafety.com.br" className="hover:text-white">
                  contato@itasafety.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden />
                <span>São Paulo, SP — Brasil</span>
              </li>
            </ul>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.heading} aria-labelledby={`footer-${section.heading}`}>
              <h2
                id={`footer-${section.heading}`}
                className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40"
              >
                {section.heading}
              </h2>
              <ul className="space-y-3 text-sm text-white/70">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-brand-red">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {section.heading === "Empresa" && (
                  <li>
                    <a
                      href="https://wa.me/5511988776655"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-brand-red"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            © {new Date().getFullYear()} ItaSafety EPI Ltda · São Paulo, BR
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Conformidade NR-06 · NR-10 · NR-35 · ISO 9001
          </p>
        </div>
      </Container>
    </footer>
  );
}
