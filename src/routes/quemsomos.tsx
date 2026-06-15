import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Target, Users, Award } from "lucide-react";
import { pageMeta } from "@/lib/seo";

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

function QuemSomosPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-blue to-brand-blue-active py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-[12px] font-bold uppercase tracking-wider text-brand-blue-light">
            Quem Somos
          </p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Segurança que protege quem produz
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            A ItaSafety é especializada em Equipamentos de Proteção Individual (EPI) certificados
            pelo MTE, atendendo empresas de todo o Brasil com qualidade, suporte técnico e entrega
            ágil.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-white p-7">
          <Target className="size-9 text-brand-blue" />
          <h2 className="mt-4 text-xl font-bold text-ink">Missão</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Garantir segurança e bem-estar no ambiente de trabalho fornecendo EPIs de alta
            qualidade, com atendimento técnico personalizado.
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-7">
          <Award className="size-9 text-brand-blue" />
          <h2 className="mt-4 text-xl font-bold text-ink">Visão</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Ser referência nacional em distribuição de EPIs, reconhecida pela confiabilidade dos
            produtos e pela parceria com seus clientes.
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-7">
          <ShieldCheck className="size-9 text-brand-blue" />
          <h2 className="mt-4 text-xl font-bold text-ink">Valores</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Compromisso com a vida, ética, qualidade certificada e respeito ao cliente e ao
            trabalhador.
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-7">
          <Users className="size-9 text-brand-blue" />
          <h2 className="mt-4 text-xl font-bold text-ink">Atendimento</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Equipe técnica preparada para orientar na escolha correta de cada EPI conforme a NR
            aplicável.
          </p>
        </div>
      </section>
    </>
  );
}
