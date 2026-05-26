import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/ui/PageHero";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — ItaSafety" },
      {
        name: "description",
        content:
          "Detalhamento dos cookies utilizados pelo site ItaSafety e como gerenciar suas preferências.",
      },
    ],
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
      <section className="bg-surface-sunken py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-6 text-white/75 leading-relaxed">
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
          <p className="border-l-4 border-brand-red pl-6 text-white/80">
            Você pode revogar consentimento a qualquer momento limpando os
            dados do site no navegador. Suas preferências são salvas apenas no
            seu dispositivo.
          </p>
        </div>
      </section>
    </>
  );
}

function Row({ tag, text }: { tag: string; text: string }) {
  return (
    <div>
      <span className="inline-block bg-brand-red px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        {tag}
      </span>
      <p className="mt-3">{text}</p>
    </div>
  );
}
