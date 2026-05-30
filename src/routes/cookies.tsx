import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";

import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({
  head: () =>
    pageMeta({
      title: "Política de Cookies — ItaSafety",
      description:
        "Detalhamento dos cookies utilizados pelo site ItaSafety e como gerenciar suas preferências.",
      path: "/cookies",
    }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacidade"
        title="Política de Cookies"
        description="Usamos cookies essenciais para operar o site e cookies opcionais para entender uso agregado."
      />
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10 leading-relaxed text-ink-muted">
            <Row
              tag="Essenciais"
              text="Garantem funcionamento básico: roteamento, sessão e preferências de consentimento. Não podem ser desativados."
            />
            <Row
              tag="Analytics (opcional)"
              text="Medem páginas mais acessadas e desempenho. Coletados de forma agregada e anonimizada, sem identificar pessoas físicas."
            />
            <Row
              tag="Marketing (opcional)"
              text="Atualmente não utilizados. Caso passem a ser, exigirão consentimento explícito e novo aviso."
            />
            <p className="rounded-sm border-l-[3px] border-brand-red bg-surface-sunken p-6 text-ink">
              Você pode revogar consentimento a qualquer momento limpando os
              dados do site no navegador. Suas preferências são salvas apenas no
              seu dispositivo.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

function Row({ tag, text }: { tag: string; text: string }) {
  return (
    <div>
      <span className="inline-block rounded-sm bg-brand-red px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        {tag}
      </span>
      <p className="mt-3">{text}</p>
    </div>
  );
}
