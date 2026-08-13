import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const STEPS = [
  "Conte o contexto da operação",
  "Reúna os itens da sua lista",
  "Receba o retorno comercial",
];

export default function CommercialCTA() {
  return (
    <section className="bg-white px-3 py-3 sm:px-5 sm:py-5">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 py-20 text-white md:py-28">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(51,120,199,0.28),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(211,47,47,0.15),transparent_34%)]"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl">
              <Eyebrow tone="onDark">Próximo passo</Eyebrow>
              <h2 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.03] tracking-[-0.05em] md:text-5xl lg:text-6xl">
                Sua cotação começa com uma conversa clara.
              </h2>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/68">
                Compartilhe sua necessidade e a equipe comercial ajuda a organizar a solicitação
                para o próximo passo.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contato"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-slate-950 outline-none transition duration-300 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Solicitar atendimento
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <a
                  href="tel:+551151785655"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-bold text-white outline-none transition duration-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <Phone className="size-4" aria-hidden />
                  (11) 5178-5655
                </a>
              </div>
            </div>

            <ol className="grid gap-3">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className="flex min-h-16 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-5 backdrop-blur-xl"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-3 text-sm font-semibold text-white/84">
                    {step}
                    <Check className="size-4 text-white/50" aria-hidden />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
}
