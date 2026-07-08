import { Phone, ArrowRight } from "lucide-react";

export default function ContactBanner() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-6">
        <a
          href="tel:+551151785655"
          className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light p-6 text-white shadow-lift transition-all hover:shadow-strong md:flex-row md:items-center md:gap-6 md:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur md:size-16">
            <Phone className="size-7 md:size-8" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              Atendimento Comercial
            </p>
            <h3 className="mt-1 text-xl font-extrabold leading-tight md:text-2xl">
              Fale com a nossa Central de Vendas
            </h3>
            <p className="mt-1.5 max-w-xl text-sm text-white/85">
              Cotação rápida, suporte técnico e indicação de EPI por função operacional — resposta
              imediata em horário comercial.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-brand-blue transition-transform group-hover:translate-x-1">
            Ligar agora
            <ArrowRight className="size-4" />
          </span>
        </a>
      </div>
    </section>
  );
}
