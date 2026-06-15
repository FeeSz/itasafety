import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5511988776655";

export default function WhatsAppBanner() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-6">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#128C7E] via-[#1BA77B] to-[#25D366] p-6 text-white shadow-lift transition-all hover:shadow-strong md:flex-row md:items-center md:gap-6 md:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur md:size-16">
            <MessageCircle className="size-7 md:size-8" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              Atendimento Comercial
            </p>
            <h3 className="mt-1 text-xl font-extrabold leading-tight md:text-2xl">
              Fale com um especialista no WhatsApp
            </h3>
            <p className="mt-1.5 max-w-xl text-sm text-white/85">
              Cotação rápida, suporte técnico e indicação de EPI por função operacional — resposta
              em até 1h em horário comercial.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#128C7E] transition-transform group-hover:translate-x-1">
            Iniciar conversa
            <ArrowRight className="size-4" />
          </span>
        </a>
      </div>
    </section>
  );
}
