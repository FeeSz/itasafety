import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Clock, Linkedin, Instagram, Facebook } from "lucide-react";
import Logo from "./Logo";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  const topCats = CATEGORIES.slice(0, 8);
  return (
    <footer className="bg-announce-dark text-white/85">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="bg-white/95 inline-block rounded-md p-2">
              <Logo />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Equipamentos de Proteção Individual com qualidade e certificação. Fornecendo segurança
              para empresas de todo o Brasil.
            </p>
            <div className="mt-5 flex gap-3">
              {[Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Rede social"
                  className="grid size-9 place-items-center rounded-md bg-white/5 text-white/60 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:-translate-y-1 hover:scale-110 hover:shadow-md"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <nav aria-label="Categorias">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-brand-blue-light">
              Categorias
            </h2>
            <ul className="space-y-2 text-sm text-white/70">
              {topCats.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/departamento/$slug"
                    params={{ slug: c.slug }}
                    className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Institucional */}
          <nav aria-label="Institucional">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-brand-blue-light">
              Institucional
            </h2>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/quemsomos" className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/localizacao" className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1">
                  Localização
                </Link>
              </li>
              <li>
                <Link to="/contato" className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href="https://consultaca.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1"
                >
                  Consulta de CA (MTE) ↗
                </a>
              </li>
            </ul>
          </nav>

          {/* Contato */}
          <div>
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.15em] text-brand-blue-light">
              Contato
            </h2>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-blue-light" />
                <a href="mailto:contato@itasafety.com.br" className="inline-block transition-all duration-300 hover:text-white hover:translate-x-1">
                  contato@itasafety.com.br
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-blue-light" />
                <span>São Paulo, SP — Brasil</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-blue-light" />
                <span>Seg–Sex, 08h às 18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-[12px] text-white/45">
            © {new Date().getFullYear()} ItaSafety. Todos os direitos reservados.
          </p>
          <p className="text-[12px] text-white/45">
            Conformidade NR-06 · Produtos certificados pelo MTE
          </p>
        </div>
      </div>
    </footer>
  );
}
