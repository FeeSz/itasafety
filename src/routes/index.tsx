import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import heroImg from "@/assets/hero-industrial.jpg";
import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturedProducts from "@/components/sections/FeaturedProducts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ItaSafety — Proteção Industrial que Não Negocia" },
      {
        name: "description",
        content:
          "Distribuidora de EPIs para indústrias brasileiras. Capacetes, respiradores, cinturões, luvas, calçados e consultoria técnica em conformidade com as NRs.",
      },
      { property: "og:title", content: "ItaSafety — Proteção Industrial que Não Negocia" },
      { property: "og:image", content: "/favicon-mark.png" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden border-b-4 border-brand-red">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep via-brand-navy-deep/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-navy-deep to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
          <div className="max-w-3xl space-y-8 animate-reveal">
            <div className="inline-flex items-center gap-3 border-l-4 border-brand-red bg-white/5 py-1 pl-4 backdrop-blur-sm">
              <span className="font-mono text-xs uppercase tracking-tighter text-brand-red">
                Conformidade NR-06 · NR-10 · NR-35
              </span>
            </div>
            <h1 className="text-balance font-display text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-7xl lg:text-8xl">
              Proteção que <br />
              <span className="text-brand-red">não negocia.</span>
            </h1>
            <p className="max-w-xl text-pretty text-lg font-medium leading-relaxed text-white/75">
              Distribuição enterprise de equipamentos de proteção individual e
              engenharia de segurança para complexos industriais de alta
              criticidade.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/categorias"
                className="group flex items-center gap-3 bg-brand-red px-7 py-4 font-display text-sm font-bold uppercase tracking-tighter text-white transition-colors hover:bg-brand-red-dark"
              >
                Ver Catálogo
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                to="/contato"
                className="border-2 border-white/20 px-7 py-4 font-display text-sm font-bold uppercase tracking-tighter text-white transition-colors hover:bg-white/10"
              >
                Consultoria Técnica
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section aria-label="Indicadores de confiança" className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-12 gap-y-6 px-6 py-10">
          <Stat value="25+" label="Anos de Mercado" />
          <Divider />
          <Stat value="100%" label="CA Ativo e Válido" />
          <Divider />
          <Stat value="24h" label="Cotação Express" />
          <Divider />
          <Stat value="500+" label="Clientes Industriais" />
          <div className="hidden gap-8 font-display font-black tracking-tighter text-brand-navy-deep/40 lg:flex">
            <span>MSA</span>
            <span>HONEYWELL</span>
            <span>3M</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-brand-navy-deep py-24">
        <div className="mx-auto max-w-7xl px-6">
          <header className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-red">
                Especialidades
              </span>
              <h2 className="mt-3 font-display text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
                Categorias de Proteção
              </h2>
            </div>
            <Link
              to="/categorias"
              className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white hover:text-brand-red"
            >
              Ver tudo →
            </Link>
          </header>
          <CategoryGrid />
        </div>
      </section>

      {/* WHY US */}
      <section className="border-y border-white/10 bg-surface-sunken py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-red">
              Por que ItaSafety
            </span>
            <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
              Engenharia que vai além do EPI.
            </h2>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            <Pillar
              icon={<ShieldCheck className="size-7" aria-hidden />}
              title="Conformidade Total"
              text="100% dos itens com CA ativo. Auditoria documental e rastreabilidade por lote para cada entrega."
            />
            <Pillar
              icon={<BadgeCheck className="size-7" aria-hidden />}
              title="Curadoria Técnica"
              text="Marcas líderes mundiais — MSA, Honeywell, 3M, Dystar — com especificação validada por nossos engenheiros."
            />
            <Pillar
              icon={<Truck className="size-7" aria-hidden />}
              title="Logística Crítica"
              text="Cotação em até 24h, frota dedicada para São Paulo e operação nacional para reposição emergencial."
            />
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-brand-navy-deep py-24">
        <div className="mx-auto max-w-7xl px-6">
          <header className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-red">
                Destaques
              </span>
              <h2 className="mt-3 font-display text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
                Catálogo em Foco
              </h2>
            </div>
          </header>
          <FeaturedProducts />
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t-8 border-brand-red bg-surface-sunken py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-balance font-display text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">
            Pronto para dimensionar a proteção da sua planta?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/70">
            Fale com um engenheiro de aplicação. Levantamento de risco, lista
            técnica e cotação personalizada — sem custo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/contato"
              className="bg-brand-red px-8 py-4 font-display text-sm font-bold uppercase tracking-tighter text-white hover:bg-brand-red-dark"
            >
              Solicitar Orçamento
            </Link>
            <a
              href="https://wa.me/5511988776655"
              target="_blank"
              rel="noreferrer"
              className="border-2 border-white/20 px-8 py-4 font-display text-sm font-bold uppercase tracking-tighter text-white hover:bg-white/10"
            >
              WhatsApp Business
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-3xl font-black tracking-tighter text-brand-navy-deep">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-navy-deep/50">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-12 w-px bg-brand-navy-deep/10 md:block" aria-hidden />;
}

function Pillar({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-brand-navy-deep p-10">
      <div className="mb-6 inline-grid size-12 place-items-center bg-brand-red text-white">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
    </div>
  );
}
