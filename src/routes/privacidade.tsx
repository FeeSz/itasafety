import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";

import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacidade")({
  head: () =>
    pageMeta({
      title: "Política de Privacidade — ItaSafety",
      description:
        "Como a ItaSafety coleta, trata e protege seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).",
      path: "/privacidade",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Compliance LGPD"
        title="Política de Privacidade"
        description="Última atualização: maio de 2026. Tratamos dados pessoais com a mesma seriedade com que tratamos segurança industrial."
      />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <article className="mx-auto max-w-3xl space-y-8 leading-relaxed text-ink-muted">
            <Block title="1. Dados coletados">
              Coletamos apenas dados necessários para responder solicitações
              comerciais: nome, e-mail corporativo, telefone, empresa/CNPJ e o
              conteúdo da mensagem enviada nos formulários de contato.
            </Block>
            <Block title="2. Base legal">
              O tratamento é baseado em execução de procedimentos preliminares a
              contrato (art. 7º, V, LGPD) e legítimo interesse (art. 7º, IX).
            </Block>
            <Block title="3. Compartilhamento">
              Não comercializamos dados. Compartilhamos apenas com fornecedores
              estritamente necessários para entrega do serviço (provedores de
              e-mail, hospedagem) sob obrigação contratual de confidencialidade.
            </Block>
            <Block title="4. Retenção">
              Dados de cotação são retidos por até 5 anos para fins fiscais e de
              documentação técnica. Após esse prazo, são anonimizados ou
              descartados.
            </Block>
            <Block title="5. Direitos do titular">
              Você pode solicitar acesso, correção, anonimização, portabilidade,
              eliminação e revogação de consentimento. Solicitações:{" "}
              <a href="mailto:dpo@itasafety.com.br" className="text-brand-red hover:underline">
                dpo@itasafety.com.br
              </a>
              .
            </Block>
            <Block title="6. Segurança">
              Aplicamos controles técnicos e organizacionais — HTTPS, controle de
              acesso baseado em função, registro de auditoria e revisão periódica
              — para proteger seus dados contra acesso não autorizado.
            </Block>
            <Block title="7. Encarregado (DPO)">
              Encarregado pelo tratamento de dados pessoais: contato pelo e-mail
              indicado no item 5.
            </Block>
          </article>
        </Container>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
