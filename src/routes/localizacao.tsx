import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { pageMeta, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/localizacao")({
  head: () => {
    const base = pageMeta({
      title: "Localização e Contato — ItaSafety",
      description:
        "Endereço, horário de atendimento, telefone e e-mail da ItaSafety. Atendemos empresas em todo o Brasil.",
      path: "/localizacao",
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
            url: SITE_URL,
            telephone: "+55-11-5178-5655",
            email: "contato@itasafety.com.br",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Rua Caraguatatuba, 97",
              addressLocality: "São Paulo",
              addressRegion: "SP",
              postalCode: "08110-120",
              addressCountry: "BR",
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "18:00",
            },
          }),
        },
      ],
    };
  },
  component: LocalizacaoPage,
});

function LocalizacaoPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-ink">Localização</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Estamos prontos para atender empresas em todo o Brasil.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border border-hairline bg-white p-6">
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-brand-blue" />
              <div>
                <p className="font-bold text-ink">Endereço</p>
                <p className="text-ink-muted">Rua Caraguatatuba, 97</p>
                <p className="text-ink-muted">São Paulo / SP</p>
                <p className="text-ink-muted">CEP: 08110-120</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 text-brand-blue" />
              <div>
                <p className="font-bold text-ink">Horário</p>
                <p className="text-ink-muted">Seg–Sex, 08h às 18h</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-brand-blue" />
              <div>
                <p className="font-bold text-ink">Telefone</p>
                <p className="text-ink-muted">+55 (11) 5178-5655</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-brand-blue" />
              <div>
                <p className="font-bold text-ink">E-mail</p>
                <a
                  href="mailto:contato@itasafety.com.br"
                  className="text-brand-blue hover:underline"
                >
                  contato@itasafety.com.br
                </a>
              </div>
            </li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface-sunken">
          <iframe
            title="Mapa ItaSafety"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.4850%2C-23.5350%2C-46.4550%2C-23.5150&layer=mapnik&marker=-23.5249%2C-46.4700"
            className="h-[400px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
