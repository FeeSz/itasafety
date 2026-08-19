import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import Container from "@/components/ui/Container";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => {
    const base = pageMeta({
      title: "Entre em contato — ItaSafety",
      description: "Fale com a equipe ItaSafety por telefone, e-mail ou formulário de contato.",
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
            url: "https://itasafety.com.br/contato",
            image: "https://itasafety.com.br/favicon-mark.png",
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

const channels = [
  {
    label: "Telefone",
    value: "(11) 5178-5655",
    detail: "Segunda a sexta, das 8h às 18h",
    href: "tel:+551151785655",
    external: true,
  },
  {
    label: "E-mail",
    value: "contato@itasafety.com.br",
    detail: "Dúvidas, sugestões e assuntos institucionais",
    href: "mailto:contato@itasafety.com.br",
    external: true,
  },
  {
    label: "Localização",
    value: "São Paulo, SP",
    detail: "Consulte o endereço e a rota",
    href: "/localizacao",
    external: false,
  },
] as const;

function ContactPage() {
  return (
    <div className="bg-background">
      <Container size="lg" className="py-14 sm:py-20 lg:py-24">
        <header className="max-w-3xl border-b border-border pb-10 sm:pb-14">
          <p className="text-label font-semibold text-primary">Contato</p>
          <h1 className="mt-4 text-balance text-display font-semibold text-foreground">
            Fale com a ItaSafety.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-body-lg leading-relaxed text-foreground-muted">
            Escolha um canal direto ou envie uma mensagem. Sem etapas desnecessárias.
          </p>
        </header>

        <div className="grid gap-14 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(32rem,1.28fr)] lg:gap-20 xl:gap-28">
          <aside aria-labelledby="contact-channels-title">
            <h2 id="contact-channels-title" className="text-title-md font-semibold tracking-tight text-foreground">
              Canais diretos
            </h2>
            <p className="mt-3 max-w-sm text-body leading-relaxed text-foreground-muted">
              Para cotações, selecione os produtos no catálogo. Este canal é dedicado a dúvidas,
              sugestões, contato e elogios.
            </p>

            <dl className="mt-8 border-t border-border">
              {channels.map((channel) => (
                <div key={channel.label} className="border-b border-border py-5">
                  <dt className="text-caption font-medium text-foreground-muted">{channel.label}</dt>
                  <dd className="mt-1">
                    {channel.external ? (
                      <a
                        href={channel.href}
                        className="group inline-flex max-w-full items-center gap-2 break-all text-body font-semibold text-foreground hover:text-primary"
                      >
                        {channel.value}
                        <ArrowUpRight
                          className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <Link
                        to={channel.href}
                        className="group inline-flex items-center gap-2 text-body font-semibold text-foreground hover:text-primary"
                      >
                        {channel.value}
                        <ArrowUpRight
                          className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                    <p className="mt-1 text-caption leading-relaxed text-foreground-subtle">{channel.detail}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          <section aria-labelledby="contact-form-title" className="lg:border-l lg:border-border lg:pl-16 xl:pl-20">
            <div className="mb-8">
              <h2 id="contact-form-title" className="text-title-lg font-semibold tracking-tight text-foreground">
                Envie uma mensagem
              </h2>
              <p className="mt-2 text-body text-foreground-muted">
                Os campos marcados como opcionais podem ficar em branco.
              </p>
            </div>
            <ContactForm />
          </section>
        </div>
      </Container>
    </div>
  );
}
