import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Container from "@/components/ui/Container";
import CtaButton from "@/components/ui/CtaButton";
import Eyebrow from "@/components/ui/Eyebrow";

export default function CommercialCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-navy-deep py-24 md:py-32">
      <div className="absolute inset-0 bg-grid-faint opacity-30" aria-hidden />
      <div
        className="absolute -right-32 top-1/2 hidden h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-brand-red/15 blur-3xl md:block"
        aria-hidden
      />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="text-white">
              <Eyebrow tone="onDark">Cotação Técnica</Eyebrow>
            </div>
            <h2 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              Vamos dimensionar a proteção da sua planta?
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/70">
              Fale com um engenheiro de aplicação. Levantamento de risco, lista técnica e proposta
              personalizada — sem custo, em até 24h úteis.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="group rounded-md transition-shadow hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]">
                <CtaButton as={Link} to="/contato" size="lg">
                  Solicitar Orçamento
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </CtaButton>
              </div>
              <CtaButton
                as="a"
                href="tel:+551151785655"
                variant="outlineLight"
                size="lg"
              >
                <Phone className="size-4" aria-hidden />
                Central de Vendas
              </CtaButton>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10">
            <Stat label="Cotação Express" value="24h" end={24} suffix="h" />
            <Stat label="CA Ativo" value="100%" end={100} suffix="%" />
            <Stat label="Clientes Industriais" value="500+" end={500} suffix="+" />
            <Stat label="Anos de Mercado" value="25+" end={25} suffix="+" />
          </dl>
        </div>
      </Container>
    </section>
  );
}

function Stat({ label, value, end, suffix }: { label: string; value: string; end?: number; suffix?: string }) {
  return (
    <div className="bg-brand-navy-deep p-6 md:p-8">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</dt>
      <dd className="mt-3 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
        {end !== undefined ? <AnimatedCounter end={end} suffix={suffix || ""} /> : value}
      </dd>
    </div>
  );
}
