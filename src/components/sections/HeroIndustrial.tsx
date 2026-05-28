import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-industrial.jpg";
import Container from "@/components/ui/Container";
import CtaButton from "@/components/ui/CtaButton";
import Eyebrow from "@/components/ui/Eyebrow";

export default function HeroIndustrial() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-grid-faint opacity-70" aria-hidden />
      <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24 xl:py-28">
        {/* Copy */}
        <div className="animate-reveal">
          <Eyebrow>Distribuidora Industrial · Desde 1998</Eyebrow>
          <h1 className="mt-6 text-balance font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
            Proteção que não{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-red">negocia.</span>
              <span
                className="absolute -bottom-1 left-0 h-3 w-full bg-brand-red/10"
                aria-hidden
              />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            Distribuição enterprise de equipamentos de proteção individual e
            engenharia de segurança para complexos industriais de alta
            criticidade. Conformidade NR-06, NR-10, NR-35 e ISO 9001.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton as={Link} to="/categorias" className="group">
              Ver Catálogo
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </CtaButton>
            <CtaButton as={Link} to="/contato" variant="outline">
              Consultoria Técnica
            </CtaButton>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-hairline pt-8">
            <div className="flex items-center gap-2.5 text-ink-muted">
              <ShieldCheck className="size-5 text-brand-red" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                100% CA Ativo
              </span>
            </div>
            <span className="hidden h-4 w-px bg-hairline sm:block" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              500+ Clientes Industriais
            </span>
            <span className="hidden h-4 w-px bg-hairline sm:block" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              Cotação 24h
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-hairline bg-surface-sunken shadow-lift">
            <img
              src={heroImg}
              alt="Operador industrial utilizando equipamento de proteção individual em ambiente de alta criticidade"
              width={1200}
              height={1500}
              fetchPriority="high"
              className="size-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr from-brand-navy-deep/40 via-transparent to-transparent"
              aria-hidden
            />
            {/* Floating tech card */}
            <div className="absolute bottom-6 left-6 right-6 rounded-md border border-white/20 bg-white/95 p-5 shadow-lift backdrop-blur md:right-auto md:max-w-[280px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Norma Regulamentadora
              </p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                NR-06 · NR-35
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                EPI dimensionado por engenheiro de segurança credenciado.
              </p>
            </div>
          </div>

          {/* Decorative accent */}
          <div
            className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 border-2 border-brand-red"
            aria-hidden
          />
          <div
            className="absolute -top-4 -left-4 -z-10 h-24 w-24 bg-brand-navy/5"
            aria-hidden
          />
        </div>
      </Container>
    </section>
  );
}
