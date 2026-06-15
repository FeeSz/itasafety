import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";

import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/termos")({
  head: () =>
    pageMeta({
      title: "Termos de Uso — ItaSafety",
      description: "Termos de uso do site institucional ItaSafety e regras de envio de cotação.",
      path: "/termos",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Termos"
        title="Termos de Uso"
        description="Ao navegar e enviar solicitações pelo site, você concorda com as condições abaixo."
      />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <article className="mx-auto max-w-3xl space-y-8 leading-relaxed text-ink-muted">
            <Block title="1. Objeto">
              Este site apresenta o portfólio comercial da ItaSafety EPI Ltda. Os conteúdos e
              cotações são informativos e não constituem oferta firme antes de validação contratual
              escrita.
            </Block>
            <Block title="2. Uso permitido">
              É vedada a reprodução, total ou parcial, de textos, imagens ou código sem autorização
              expressa. Marcas de terceiros pertencem aos seus respectivos titulares.
            </Block>
            <Block title="3. Disponibilidade">
              Buscamos manter o site disponível em regime contínuo, sem garantir ausência de falhas
              técnicas, interrupções para manutenção ou casos fortuitos.
            </Block>
            <Block title="4. Limitação de responsabilidade">
              A ItaSafety não se responsabiliza por uso indevido de informações técnicas extraídas
              do site sem consultoria formal. Especificação de EPI deve sempre ser validada por
              profissional habilitado.
            </Block>
            <Block title="5. Lei e foro">
              Aplica-se a legislação brasileira. Fica eleito o foro da Comarca de São Paulo/SP para
              dirimir controvérsias.
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
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
