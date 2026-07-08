import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import QuoteForm from "@/components/forms/QuoteForm";
import Container from "@/components/ui/Container";

import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => {
    const base = pageMeta({
      title: "Solicitar Orçamento — ItaSafety",
      description:
        "Fale com um engenheiro de aplicação ItaSafety. Cotação técnica, levantamento de risco e atendimento corporativo para indústrias.",
      path: "/contato",
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "ItaSafety",
            url: "https://itasafety.lovable.app/contato",
            image: "https://itasafety.lovable.app/favicon-mark.png",
            telephone: ["+55-11-5178-5655", "+55-11-2963-0303"],
            email: "contato@itasafety.com.br",
            address: {
              "@type": "PostalAddress",
              addressLocality: "São Paulo",
              addressRegion: "SP",
              addressCountry: "BR",
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "08:00",
                closes: "18:00",
              },
            ],
            areaServed: "BR",
          }),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Atendimento Corporativo"
        title="Fale com a engenharia ItaSafety."
        description="Cotação técnica em até 24h úteis. Para urgências operacionais, utilize nossa Central de Vendas — atendimento humano em horário comercial."
      />

      <section className="bg-white py-20 md:py-24">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="space-y-8">
            <ContactItem
              icon={<Phone className="size-5" aria-hidden />}
              label="Central de Vendas"
              value="+55 (11) 5178-5655"
              href="tel:+551151785655"
            />
            <ContactItem
              icon={<Phone className="size-5" aria-hidden />}
              label="Linha Alternativa"
              value="+55 (11) 2963-0303"
              href="tel:+551129630303"
            />
            <ContactItem
              icon={<Mail className="size-5" aria-hidden />}
              label="Corporativo / Licitações"
              value="contato@itasafety.com.br"
              href="mailto:contato@itasafety.com.br"
            />
            <ContactItem
              icon={<MapPin className="size-5" aria-hidden />}
              label="Sede Operacional"
              value="São Paulo, SP — Brasil"
            />

            <div className="rounded-md border border-hairline border-l-[3px] border-l-brand-red bg-surface-sunken p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">
                Horário Comercial
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Segunda a sexta · 08h00 às 18h00 (horário de Brasília)
              </p>
            </div>
          </div>

          <QuoteForm />
        </Container>
      </section>
    </>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <div className="grid size-12 shrink-0 place-items-center rounded-sm bg-brand-navy/5 text-brand-navy transition-colors group-hover:bg-brand-red group-hover:text-white">
        {icon}
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">{label}</p>
        <p className="mt-1 font-display text-lg font-bold tracking-tight text-ink">{value}</p>
      </div>
    </>
  );
  return href ? (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-center gap-5"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-5">{content}</div>
  );
}
