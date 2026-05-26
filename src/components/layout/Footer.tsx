import { Link } from "@tanstack/react-router";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t-8 border-brand-red bg-brand-navy-deep pb-12 pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-white/60">
              Distribuição enterprise de equipamentos de proteção individual e
              consultoria técnica para indústrias brasileiras desde 1998.
              Comprometidos com a vida e a conformidade normativa.
            </p>
          </div>
          <nav aria-label="Categorias no rodapé">
            <h5 className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Categorias
            </h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/categorias" className="hover:text-brand-red">Proteção Cabeça</Link></li>
              <li><Link to="/categorias" className="hover:text-brand-red">Proteção Visual</Link></li>
              <li><Link to="/categorias" className="hover:text-brand-red">Proteção Respiratória</Link></li>
              <li><Link to="/categorias" className="hover:text-brand-red">Trabalho em Altura</Link></li>
              <li><Link to="/categorias" className="hover:text-brand-red">Calçados de Segurança</Link></li>
            </ul>
          </nav>
          <nav aria-label="Empresa no rodapé">
            <h5 className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Empresa
            </h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/sobre" className="hover:text-brand-red">Quem Somos</Link></li>
              <li><Link to="/contato" className="hover:text-brand-red">Fale Conosco</Link></li>
              <li><a href="https://wa.me/5511988776655" target="_blank" rel="noreferrer" className="hover:text-brand-red">WhatsApp</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal no rodapé">
            <h5 className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Legal
            </h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/privacidade" className="hover:text-brand-red">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-brand-red">Termos de Uso</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-red">Política de Cookies</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            © {new Date().getFullYear()} ItaSafety EPI Ltda · São Paulo, BR
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Conformidade NR-06 · NR-10 · NR-35 · ISO 9001
          </p>
        </div>
      </div>
    </footer>
  );
}
