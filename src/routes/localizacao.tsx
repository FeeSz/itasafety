import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/localizacao")({
  head: () => ({
    meta: [
      { title: "Localização — ItaSafety" },
      { name: "description", content: "Onde estamos e como nos encontrar." },
    ],
  }),
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
                <p className="text-ink-muted">São Paulo, SP — Brasil</p>
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
                <p className="text-ink-muted">+55 (11) 2626-7417</p>
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
            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.7%2C-23.65%2C-46.55%2C-23.5&layer=mapnik"
            className="h-[400px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
