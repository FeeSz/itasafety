import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import QuoteForm from "@/components/forms/QuoteForm";
import Container from "@/components/ui/Container";
import ContactCard from "@/components/ui/ContactCard";
import Reveal from "@/components/ui/Reveal";

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

/** Returns true during business hours (Mon–Fri, 08–18 Brasília time) */
function useIsOpen() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const day  = now.getDay();  // 0=Sun
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}

function ContactPage() {
  const isOpen = useIsOpen();

  return (
    <>
      {/* ─── HERO SPLIT ─── */}
      <section className="relative grid min-h-[calc(100svh-var(--header-h,72px))] lg:grid-cols-2">

        {/* LEFT — Dark panel */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-[#0d1f3c] px-8 py-20 md:px-14 lg:py-28">
          {/* Grid dots */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(59,125,216,0.16) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Ambient glow */}
          <div aria-hidden className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-brand-blue/15 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -right-16 bottom-1/4 size-56 rounded-full bg-brand-red/10 blur-[80px]" />

          <div className="relative max-w-md">
            {/* Eyebrow */}
            <Reveal>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue-light">
                Atendimento Corporativo
              </p>
            </Reveal>

            {/* Headline */}
            <Reveal delay={100}>
              <h1 className="mt-4 text-balance font-display text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Fale com quem{" "}
                <span className="text-brand-red">entende</span>{" "}
                de EPI.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-4 text-pretty text-base leading-relaxed text-white/65">
                Cotação técnica em até 24h úteis. Para urgências operacionais, use nossa
                Central de Vendas — atendimento humano em horário comercial.
              </p>
            </Reveal>

            {/* SLA badge */}
            <Reveal delay={280}>
              <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-brand-blue/30 bg-brand-blue/15 px-4 py-2 backdrop-blur-sm">
                <span className="size-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
                <span className="text-sm font-semibold text-white/90">Respondemos em até 24h úteis</span>
              </div>
            </Reveal>

            {/* Quick contact strip */}
            <Reveal delay={360}>
              <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
                <a
                  href="tel:+551151785655"
                  className="group flex items-center gap-4 text-white/70 transition-colors hover:text-white"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/8 transition-colors group-hover:bg-brand-blue/30">
                    <Phone className="size-4" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Central de Vendas</p>
                    <p className="text-sm font-bold">(11) 5178-5655</p>
                  </div>
                </a>

                <a
                  href="mailto:contato@itasafety.com.br"
                  className="group flex items-center gap-4 text-white/70 transition-colors hover:text-white"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/8 transition-colors group-hover:bg-brand-blue/30">
                    <Mail className="size-4" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">E-mail corporativo</p>
                    <p className="text-sm font-bold">contato@itasafety.com.br</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-white/70">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/8">
                    <MapPin className="size-4" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Sede Operacional</p>
                    <p className="text-sm font-bold">São Paulo, SP — Brasil</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Open/Closed indicator */}
            <Reveal delay={420}>
              <div className="mt-6 flex items-center gap-2 text-sm">
                <span
                  className={`size-2 rounded-full ${isOpen ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]" : "bg-white/30"}`}
                />
                <span className={isOpen ? "text-green-400 font-semibold" : "text-white/45"}>
                  {isOpen ? "Estamos abertos agora" : "Fechado · Abrimos seg–sex às 08h"}
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="flex items-center justify-center bg-white px-8 py-16 md:px-14">
          <div className="w-full max-w-lg">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* ─── CONTACT CARDS ─── */}
      <section className="bg-surface-sunken py-16 md:py-20">
        <Container>
          <Reveal>
            <div className="mb-10 text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                Outros canais
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
                Prefere outro canal?
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={<Phone className="size-5" strokeWidth={1.8} />}
              label="Central de Vendas"
              value="(11) 5178-5655"
              href="tel:+551151785655"
              badge="Atendimento humano"
              badgeColor="blue"
              delay={0}
            />
            <ContactCard
              icon={<Phone className="size-5" strokeWidth={1.8} />}
              label="Linha Alternativa"
              value="(11) 2963-0303"
              href="tel:+551129630303"
              delay={80}
            />
            <ContactCard
              icon={<Mail className="size-5" strokeWidth={1.8} />}
              label="Corporativo / Licitações"
              value="contato@itasafety.com.br"
              href="mailto:contato@itasafety.com.br"
              delay={160}
            />
            <ContactCard
              icon={<MapPin className="size-5" strokeWidth={1.8} />}
              label="Sede"
              value="São Paulo, SP"
              delay={240}
            />
          </div>
        </Container>
      </section>

      {/* ─── URGENCY BANNER ─── */}
      <section className="bg-white py-8">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue-active via-brand-blue to-brand-blue-light p-8 text-white shadow-lift md:p-10">
              {/* Sweep shine effect */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <Clock className="size-7" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Urgências Operacionais
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold leading-tight md:text-2xl">
                      Precisa de EPI agora? Ligue.
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      Atendimento humano · Seg–Sex · 08h às 18h
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+551151785655"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-blue transition-transform hover:translate-x-1"
                >
                  (11) 5178-5655
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
