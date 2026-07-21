import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Award, ShieldCheck, Users, ArrowRight, ChevronDown } from "lucide-react";
import { pageMeta } from "@/lib/seo";

import SectionDark from "@/components/ui/SectionDark";
import PillarCard from "@/components/ui/PillarCard";
import KpiStrip from "@/components/sections/KpiStrip";
import CertBadgesGrid from "@/components/ui/CertBadgesGrid";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export const Route = createFileRoute("/quemsomos")({
  head: () =>
    pageMeta({
      title: "Quem Somos — ItaSafety",
      description:
        "Conheça a ItaSafety: distribuidora de Equipamentos de Proteção Individual com foco em qualidade, certificação e atendimento técnico para indústrias.",
      path: "/quemsomos",
    }),
  component: QuemSomosPage,
});

// Floating particle dot
function Particle({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={style}
      className={`pointer-events-none absolute rounded-full bg-brand-blue/20 blur-sm animate-float-3d ${className}`}
    />
  );
}

function QuemSomosPage() {
  return (
    <>
      {/* ─── 1. HERO IMERSIVO ─── */}
      <SectionDark className="pb-0 pt-28 md:pt-36">
        {/* Floating particles */}
        <Particle className="left-[8%] top-[20%] size-24"  style={{ animationDelay: "0s",    animationDuration: "7s" }} />
        <Particle className="left-[75%] top-[15%] size-16" style={{ animationDelay: "1.5s",  animationDuration: "9s" }} />
        <Particle className="left-[55%] top-[60%] size-10" style={{ animationDelay: "3s",    animationDuration: "6s" }} />
        <Particle className="left-[20%] top-[70%] size-8"  style={{ animationDelay: "0.8s",  animationDuration: "8s" }} />
        <Particle className="left-[88%] top-[55%] size-20" style={{ animationDelay: "2.2s",  animationDuration: "10s" }} />

        <Container className="pb-16 text-center">
          {/* Eyebrow badges */}
          <Reveal>
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              {["CA/MTE", "NR-6", "INMETRO", "15+ Anos"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-brand-blue-light/30 bg-brand-blue/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-blue-light"
                >
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl mx-auto text-balance font-display text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Segurança que{" "}
              <span className="relative inline-block text-brand-red">
                protege
                {/* Underline glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-brand-red opacity-60 blur-[2px]"
                />
              </span>{" "}
              quem produz.
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
              Há mais de 15 anos a ItaSafety fornece EPIs certificados pelo MTE para as maiores
              indústrias do Brasil — com suporte técnico, entrega ágil e conformidade garantida.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={360}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-brand-red-dark hover:shadow-xl active:scale-[0.98]"
              >
                Solicitar cotação
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/categorias"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white/80 transition-all hover:border-white/40 hover:text-white"
              >
                Ver catálogo
              </Link>
            </div>
          </Reveal>

          {/* Scroll indicator */}
          <Reveal delay={500}>
            <div className="mt-14 flex justify-center">
              <div className="flex animate-bounce flex-col items-center gap-1.5 text-white/40">
                <span className="font-mono text-[10px] uppercase tracking-widest">Conheça mais</span>
                <ChevronDown className="size-5" />
              </div>
            </div>
          </Reveal>
        </Container>

        {/* KPI Strip */}
        <KpiStrip />
      </SectionDark>

      {/* ─── 2. NOSSA ESSÊNCIA ─── */}
      <section className="bg-surface-sunken py-20 md:py-28">
        <Container>
          <Reveal>
            <div className="mb-12 text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                Nossa Essência
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                O que nos move todos os dias
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PillarCard
              number="01"
              label="Missão"
              icon={<Target className="size-7" strokeWidth={1.8} />}
              title="Proteger quem trabalha"
              description="Garantir segurança e bem-estar no ambiente de trabalho fornecendo EPIs de alta qualidade, com atendimento técnico personalizado e conformidade total com as NRs."
              accentColor="blue"
              delay={0}
            />
            <PillarCard
              number="02"
              label="Visão"
              icon={<Award className="size-7" strokeWidth={1.8} />}
              title="Referência nacional em EPI"
              description="Ser reconhecida como a principal distribuidora de EPIs do Brasil, pela confiabilidade dos produtos, pelo suporte técnico e pela parceria de longo prazo com nossos clientes."
              accentColor="red"
              delay={150}
            />
            <PillarCard
              number="03"
              label="Valores"
              icon={<ShieldCheck className="size-7" strokeWidth={1.8} />}
              title="Compromisso com a vida"
              description="Ética, qualidade certificada e respeito absoluto ao trabalhador e ao cliente. Acreditamos que cada EPI entregue representa uma vida protegida."
              accentColor="amber"
              delay={300}
            />
          </div>

          {/* Atendimento row — ocupa largura toda */}
          <div className="mt-6">
            <PillarCard
              number="04"
              label="Atendimento"
              icon={<Users className="size-7" strokeWidth={1.8} />}
              title="Engenharia de aplicação"
              description="Equipe técnica especializada para orientar na escolha correta de cada EPI conforme a NR aplicável ao seu setor — sem deixar dúvidas no ar."
              accentColor="blue"
              delay={450}
            />
          </div>
        </Container>
      </section>

      {/* ─── 3. CERTIFICAÇÕES ─── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <Reveal>
            <div className="mb-10 text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                Conformidade
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Todos os produtos, todos os certificados
              </h2>
              <p className="mt-3 text-ink-muted max-w-xl mx-auto text-sm">
                Trabalhamos exclusivamente com EPIs que possuem certificação vigente pelas
                autoridades competentes brasileiras.
              </p>
            </div>
          </Reveal>
          <CertBadgesGrid />
        </Container>
      </section>

      {/* ─── 4. CTA FINAL DARK ─── */}
      <SectionDark className="py-20 md:py-28">
        <Container className="text-center">
          <Reveal>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue-light">
              Próximo passo
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Sua empresa está em conformidade
              <br />
              <span className="text-brand-red">com a NR-6?</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-white/65">
              Fale com nosso engenheiro de aplicação. Analisamos seu ambiente operacional e
              indicamos os EPIs corretos para cada função — sem custo.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-brand-red-dark hover:shadow-xl active:scale-[0.98]"
              >
                Falar com engenheiro
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/categorias"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white/80 transition-all hover:border-white/40 hover:text-white"
              >
                Explorar catálogo
              </Link>
            </div>
          </Reveal>
        </Container>
      </SectionDark>
    </>
  );
}
