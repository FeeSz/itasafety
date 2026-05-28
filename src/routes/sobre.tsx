import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import CtaButton from "@/components/ui/CtaButton";
import Eyebrow from "@/components/ui/Eyebrow";

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

      {/* Intro + Facts */}
      <section className="bg-white py-24 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6 text-lg leading-relaxed text-ink-muted">
            <p>
              A ItaSafety nasceu da convicção de que segurança do trabalho não
              é commodity. Cada item de EPI faz parte de uma cadeia de
              responsabilidade técnica — do Certificado de Aprovação emitido
              pelo Ministério do Trabalho ao treinamento do operador.
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

          <aside className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline self-start">
            <Fact label="Fundação" value="1998" />
            <Fact label="Clientes Ativos" value="500+" />
            <Fact label="SKUs em Catálogo" value="3.200" />
            <Fact label="CA Ativo" value="100%" />
          </aside>
        </Container>
      </section>

      {/* Commitments */}
      <section className="border-y border-hairline bg-surface-sunken py-24 md:py-28">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Compromissos</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
              Três promessas técnicas, auditáveis em contrato.
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-hairline bg-hairline md:grid-cols-3">
            <Commitment
              n="01"
              title="Conformidade Documental"
              text="CA, ficha técnica, laudo de ensaio e DOC de instrução — disponíveis a qualquer momento, com rastreabilidade por lote."
            />
            <Commitment
              n="02"
              title="Engenharia de Aplicação"
              text="Levantamento técnico in loco, matriz de risco e recomendação por função operacional, assinada por engenheiro habilitado."
            />
            <Commitment
              n="03"
              title="Continuidade Operacional"
              text="Estoque crítico mapeado e reposição emergencial 24h para clientes contratuais — sua planta não para por falta de EPI."
            />
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-4">
            <CtaButton as={Link} to="/contato">
              Falar com a Engenharia
              <ArrowRight className="size-4" aria-hidden />
            </CtaButton>
            <CtaButton as={Link} to="/categorias" variant="outline">
              Ver Catálogo
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

function Commitment({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="bg-white p-10">
      <p className="font-mono text-xs font-semibold tracking-[0.18em] text-brand-red">
        {n}
      </p>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}
