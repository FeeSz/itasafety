import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Empresa — ItaSafety EPI" },
      {
        name: "description",
        content:
          "Há mais de duas décadas fornecendo equipamentos de proteção individual e consultoria técnica para a indústria brasileira.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="A Empresa"
        title="Uma operação técnica, não um varejo de EPI."
        description="Desde 1998, somos parceiros de áreas de SSMA, suprimentos e engenharia de segurança em projetos críticos — da refinaria à construção civil pesada."
      />

      <section className="bg-surface-sunken py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6 text-lg leading-relaxed text-white/75">
            <p>
              A ItaSafety nasceu da convicção de que segurança do trabalho não
              é commodity. Cada item de EPI faz parte de uma cadeia de
              responsabilidade técnica — do CA emitido pelo Ministério do
              Trabalho ao treinamento do operador que o utiliza.
            </p>
            <p>
              Operamos como extensão da equipe de SSMA dos nossos clientes:
              especificamos, dimensionamos, validamos e entregamos. Trabalhamos
              com as marcas líderes mundiais — MSA, Honeywell, 3M, Dystar,
              DuPont, Ansell — e mantemos rastreabilidade total por lote.
            </p>
            <p>
              Atendemos hoje mais de 500 clientes industriais ativos no Brasil,
              em segmentos que vão de óleo &amp; gás e mineração a alimentos,
              farmacêutica e construção civil de grande porte.
            </p>
          </div>

          <aside className="space-y-6">
            <Fact label="Fundação" value="1998" />
            <Fact label="Clientes Ativos" value="500+" />
            <Fact label="SKUs em Catálogo" value="3.200" />
            <Fact label="CA Ativo" value="100%" />
          </aside>
        </div>
      </section>

      <section className="border-t border-white/10 bg-brand-navy-deep py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
            Compromissos
          </h2>
          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            <Commitment
              n="01"
              title="Conformidade Documental"
              text="CA, ficha técnica, laudo de ensaio e DOC de instrução — disponíveis a qualquer momento."
            />
            <Commitment
              n="02"
              title="Engenharia de Aplicação"
              text="Levantamento técnico in loco, matriz de risco e recomendação por função."
            />
            <Commitment
              n="03"
              title="Continuidade Operacional"
              text="Estoque crítico mapeado e reposição emergencial 24h para clientes contratuais."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-4 border-brand-red bg-brand-navy-deep p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl font-black tracking-tighter text-white">
        {value}
      </p>
    </div>
  );
}

function Commitment({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="bg-brand-navy-deep p-10">
      <p className="font-mono text-xs text-brand-red">{n}</p>
      <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
    </div>
  );
}
