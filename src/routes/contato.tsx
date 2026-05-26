import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import QuoteForm from "@/components/forms/QuoteForm";
import Container from "@/components/ui/Container";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Solicitar Orçamento — ItaSafety" },
      {
        name: "description",
        content:
          "Fale com um engenheiro de aplicação ItaSafety. Cotação técnica, levantamento de risco e atendimento corporativo para indústrias.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Atendimento Corporativo"
        title="Fale com a engenharia ItaSafety."
        description="Cotação técnica em até 24h úteis. Para urgências operacionais, utilize o WhatsApp Business — atendimento humano em horário comercial."
      />

      <section className="bg-surface-sunken py-24">
        <Container className="grid gap-16 lg:grid-cols-2">
          <div className="space-y-10">
            <ContactItem
              icon={<MessageCircle className="size-5" aria-hidden />}
              label="WhatsApp Business"
              value="+55 (11) 98877-6655"
              href="https://wa.me/5511988776655"
              external
            />
            <ContactItem
              icon={<Phone className="size-5" aria-hidden />}
              label="Central de Vendas"
              value="+55 (11) 2626-7417"
              href="tel:+551126267417"
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

            <div className="border-l-4 border-brand-red bg-white/5 p-6">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brand-red">
                Horário Comercial
              </p>
              <p className="mt-2 text-sm text-white/80">
                Segunda a sexta · 08h00 às 18h00 (horário de Brasília)
              </p>
            </div>
          </div>

          <QuoteForm />
        </div>
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
      <div className="grid size-12 shrink-0 place-items-center bg-white/5 text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
        {icon}
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>
        <p className="mt-1 font-display text-lg font-bold text-white">{value}</p>
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
