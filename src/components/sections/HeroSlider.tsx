import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-industrial.jpg";

type Slide = {
  eyebrow: string;
  titleStart: string;
  titleEnd: string;
  subtitle: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary: { label: string; to: string };
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Distribuidora Oficial · Desde 1998",
    titleStart: "Proteção que não negocia",
    titleEnd: ".",
    subtitle: "EPIs certificados pelo MTE para a segurança do seu time.",
    ctaPrimary: { label: "Ver catálogo", to: "/categorias" },
    ctaSecondary: { label: "Cotação técnica em 24h", to: "/contato" },
  },
  {
    eyebrow: "Destaques da Semana",
    titleStart: "Equipamento certo. Trabalho seguro",
    titleEnd: ".",
    subtitle: "Os EPIs mais procurados pela engenharia de segurança.",
    ctaPrimary: { label: "Ver destaques", to: "/departamento/protecao-visual" },
    ctaSecondary: { label: "Falar com vendas", to: "/contato" },
  },
  {
    eyebrow: "100% Certificado",
    titleStart: "Todo CA aprovado pelo MTE",
    titleEnd: ".",
    subtitle: "Cada item entregue com Certificado de Aprovação ativo.",
    ctaPrimary: { label: "Ver certificados", to: "/departamento/luvas" },
    ctaSecondary: { label: "Política de qualidade", to: "/quemsomos" },
  },
];

const TRUST = [
  { num: "500+", label: "Clientes" },
  { num: "100%", label: "CA ativo" },
  { num: "24h", label: "Cotação" },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const slide = SLIDES[i];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, #10233a 0, #050b12 55%, #020409 100%)",
        color: "#f5f7fa",
      }}
      aria-label="Banner principal"
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 85% 30%, rgba(30,136,229,0.18), transparent 60%), radial-gradient(500px 360px at 75% 80%, rgba(0,200,83,0.12), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 px-6 pb-16 pt-28 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:pb-20 md:pt-32">
        {/* Left — copy */}
        <div key={i} className="animate-fade-in">
          <p
            className="mb-3 text-[13px] font-medium uppercase"
            style={{ letterSpacing: "0.16em", color: "#7ea5ff" }}
          >
            {slide.eyebrow}
          </p>
          <h1
            className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[44px]"
            style={{ color: "#f5f7fa", marginBottom: 16 }}
          >
            {slide.titleStart}
            <span style={{ color: "#1E88E5" }}>{slide.titleEnd}</span>
          </h1>
          <p className="mb-6 max-w-[420px] text-[16px]" style={{ color: "#c4cfdd" }}>
            {slide.subtitle}
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              to={slide.ctaPrimary.to}
              className="inline-flex items-center gap-1.5 rounded-full px-[18px] py-[10px] text-[13px] font-semibold transition-transform hover:-translate-y-[1px]"
              style={{
                background: "linear-gradient(135deg, #1E88E5, #00C853)",
                color: "#050b12",
                boxShadow: "0 10px 30px rgba(0, 200, 83, 0.25)",
              }}
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              to={slide.ctaSecondary.to}
              className="inline-flex items-center gap-1.5 rounded-full px-[18px] py-[10px] text-[13px] font-medium"
              style={{
                border: "1px solid rgba(163,177,198,0.5)",
                color: "#f5f7fa",
                background: "rgba(5,11,18,0.4)",
              }}
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-[13px]" style={{ color: "#a3b1c6" }}>
            {TRUST.map((t) => (
              <div key={t.label}>
                <strong className="block text-[20px] font-bold" style={{ color: "#f5f7fa" }}>
                  {t.num}
                </strong>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — EPI card */}
        <div className="flex justify-center md:justify-end">
          <div
            className="relative flex aspect-[4/5] w-[260px] items-center justify-center overflow-hidden rounded-[28px] p-5 md:w-[320px]"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(30,136,229,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(0,200,83,0.35), transparent 55%), linear-gradient(145deg, #050b12, #0b1f33)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <img
              src={heroImg}
              alt="Equipamentos de proteção individual"
              className="size-full rounded-[20px] object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
              fetchPriority="high"
            />
            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Ir para slide ${idx + 1}`}
                  className="h-1 rounded-sm transition-all"
                  style={{
                    width: idx === i ? 22 : 7,
                    background: idx === i ? "#1E88E5" : "rgba(245,247,250,0.4)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
