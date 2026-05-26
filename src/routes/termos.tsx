import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — ItaSafety" },
      {
        name: "description",
        content:
          "Termos de uso do site institucional ItaSafety e regras de envio de cotação.",
      },
    ],
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
      <section className="bg-surface-sunken py-20">
        <article className="mx-auto max-w-3xl space-y-8 px-6 text-white/75 leading-relaxed">
          <Block title="1. Objeto">
            Este site apresenta o portfólio comercial da ItaSafety EPI Ltda. Os
            conteúdos e cotações são informativos e não constituem oferta firme
            antes de validação contratual escrita.
          </Block>
          <Block title="2. Uso permitido">
            É vedada a reprodução, total ou parcial, de textos, imagens ou
            código sem autorização expressa. Marcas de terceiros pertencem aos
            seus respectivos titulares.
          </Block>
          <Block title="3. Disponibilidade">
            Buscamos manter o site disponível em regime contínuo, sem garantir
            ausência de falhas técnicas, interrupções para manutenção ou casos
            fortuitos.
          </Block>
          <Block title="4. Limitação de responsabilidade">
            A ItaSafety não se responsabiliza por uso indevido de informações
            técnicas extraídas do site sem consultoria formal. Especificação de
            EPI deve sempre ser validada por profissional habilitado.
          </Block>
          <Block title="5. Lei e foro">
            Aplica-se a legislação brasileira. Fica eleito o foro da Comarca de
            São Paulo/SP para dirimir controvérsias.
          </Block>
        </article>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
