import { Link, useRouter } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import Logo from "./Logo";
import Container from "@/components/ui/Container";

const footerLinkClass =
  "focus-ring-inverse motion-colors inline-flex min-h-11 items-center rounded-sm text-body-sm text-white/70 hover:text-white";

export default function Footer() {
  const pathname = useRouter().state.location.pathname;
  const showModelCredit = pathname === "/";

  return (
    <footer className="bg-surface-inverse text-white/85">
      <Container className="py-10 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          <div>
            <Logo onDark />
            <p className="mt-4 max-w-sm text-body-sm text-white/70">
              Catálogo e atendimento comercial para empresas que precisam organizar a seleção de
              equipamentos de proteção individual.
            </p>
          </div>

          <nav aria-label="Explorar">
            <h2 className="text-caption font-semibold text-brand-blue-light">Explorar</h2>
            <ul className="mt-3 grid">
              <li>
                <Link to="/catalogo" className={footerLinkClass}>
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/categorias" className={footerLinkClass}>
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/carrinho" className={footerLinkClass}>
                  Lista de cotação
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Empresa">
            <h2 className="text-caption font-semibold text-brand-blue-light">Empresa</h2>
            <ul className="mt-3 grid">
              <li>
                <Link to="/sobre" className={footerLinkClass}>
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contato" className={footerLinkClass}>
                  Contato
                </Link>
              </li>
              <li>
                <a href="mailto:contato@itasafety.com.br" className={`${footerLinkClass} gap-2`}>
                  <Mail className="size-4" aria-hidden />
                  contato@itasafety.com.br
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-caption text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ItaSafety. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              to="/privacidade"
              className="focus-ring-inverse motion-colors rounded-sm hover:text-white"
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              className="focus-ring-inverse motion-colors rounded-sm hover:text-white"
            >
              Termos
            </Link>
            <Link
              to="/cookies"
              className="focus-ring-inverse motion-colors rounded-sm hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>

        {showModelCredit ? (
          <p className="mt-4 max-w-3xl text-caption leading-relaxed text-white/55">
            Modelo 3D “PPE VISOR” por{" "}
            <a
              href="https://sketchfab.com/lanzaboy"
              target="_blank"
              rel="noreferrer"
              className="focus-ring-inverse motion-colors rounded-sm text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              Lanzaman
            </a>{" "}
            no{" "}
            <a
              href="https://sketchfab.com/3d-models/ppe-visor-d2d4aaa1ee20445cb132e628e9487e40"
              target="_blank"
              rel="noreferrer"
              className="focus-ring-inverse motion-colors rounded-sm text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              Sketchfab
            </a>
            , licença{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="license noreferrer"
              className="focus-ring-inverse motion-colors rounded-sm text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              CC BY 4.0
            </a>
            .
          </p>
        ) : null}
      </Container>
    </footer>
  );
}
