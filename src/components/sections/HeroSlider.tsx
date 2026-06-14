import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-epi-3d.png";

type Slide = {
  eyebrow: string;
  titleStart: string;
  titleAccent: string;
  titleEnd: string;
  subtitle: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary: { label: string; to: string };
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Distribuidora Oficial · Desde 1998",
    titleStart: "Proteção que ",
    titleAccent: "não negocia",
    titleEnd: ".",
    subtitle:
      "EPIs certificados pelo MTE para a segurança do seu time — com cotação rápida e atendimento técnico especializado.",
    ctaPrimary: { label: "Ver Catálogo", to: "/categorias" },
    ctaSecondary: { label: "Solicitar Cotação →", to: "/contato" },
  },
  {
    eyebrow: "Destaques da Semana",
    titleStart: "Equipamento certo. ",
    titleAccent: "Trabalho seguro",
    titleEnd: ".",
    subtitle: "Os EPIs mais procurados pela engenharia de segurança.",
    ctaPrimary: { label: "Ver Destaques", to: "/departamento/protecao-visual" },
    ctaSecondary: { label: "Falar com Vendas →", to: "/contato" },
  },
  {
    eyebrow: "100% Certificado",
    titleStart: "Todo CA ",
    titleAccent: "aprovado pelo MTE",
    titleEnd: ".",
    subtitle: "Cada item entregue com Certificado de Aprovação ativo.",
    ctaPrimary: { label: "Ver Certificados", to: "/departamento/luvas" },
    ctaSecondary: { label: "Política de Qualidade →", to: "/quemsomos" },
  },
];

const TRUST = [
  { num: "500+", label: "Clientes" },
  { num: "100%", label: "CA Ativo" },
  { num: "24h", label: "Cotação" },
];

const TRANSITION_MS = 500;

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  // Auto rotate
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => changeTo((i + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, i]);

  const changeTo = (next: number) => {
    if (next === i) return;
    setVisible(false);
    window.setTimeout(() => {
      setI(next);
      setVisible(true);
    }, TRANSITION_MS);
  };

  const slide = SLIDES[i];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden bg-white"
      aria-label="Banner principal"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-10 pt-16 md:grid-cols-2 md:gap-12 md:pb-24 md:pt-36">
        {/* Left content with smooth crossfade */}
        <div
          className="max-w-xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
          }}
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-semibold text-[#374151]">
            <span className="size-2 rounded-full bg-[#C0392B]" />
            {slide.eyebrow}
          </span>

          <h1 className="mt-6 font-display text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#111111] md:text-[56px]">
            {slide.titleStart}
            <span className="text-[#C0392B]">{slide.titleAccent}</span>
            {slide.titleEnd}
          </h1>

          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#6B7280]">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={slide.ctaPrimary.to}
              className="rounded-full bg-[#111111] px-7 py-3.5 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-[#374151]"
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              to={slide.ctaSecondary.to}
              className="rounded-full border border-[#E5E7EB] bg-white px-7 py-3.5 text-[14px] font-bold text-[#111111] transition-colors hover:border-[#111111]"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          {/* Trust numbers */}
          <div className="mt-10 flex items-center">
            {TRUST.map((t, idx) => (
              <div
                key={t.label}
                className={`flex flex-col px-6 first:pl-0 ${
                  idx < TRUST.length - 1 ? "border-r border-[#E5E7EB]" : ""
                }`}
              >
                <span className="text-[22px] font-extrabold text-[#111111]">
                  {t.num}
                </span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual — transparent 3D with hover animation */}
        <div className="hero-3d group relative hidden items-center justify-center md:flex">
          <img
            src={heroImg}
            alt="Equipamentos de proteção individual: capacete, óculos e luvas"
            width={1024}
            height={1024}
            fetchPriority="high"
            className="hero-3d__img w-full max-w-[560px] select-none object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
            draggable={false}
          />
        </div>
      </div>

      {/* Controls: arrows + indicators */}
      <div className="mx-auto -mt-6 mb-8 flex max-w-7xl items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeTo((i - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Slide anterior"
            className="grid size-9 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#111111] transition-all hover:border-[#111111] hover:scale-105"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => changeTo((i + 1) % SLIDES.length)}
            aria-label="Próximo slide"
            className="grid size-9 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#111111] transition-all hover:border-[#111111] hover:scale-105"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => changeTo(idx)}
              aria-label={`Ir para slide ${idx + 1}`}
              className="h-1 rounded-sm transition-all"
              style={{
                width: idx === i ? 24 : 8,
                background: idx === i ? "#111111" : "#D1D5DB",
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hero3dFloat {
          0%   { transform: translateY(0) rotate(0deg); }
          25%  { transform: translateY(-6px) rotate(-1.2deg); }
          50%  { transform: translateY(0) rotate(0deg); }
          75%  { transform: translateY(-4px) rotate(1.2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .hero-3d__img {
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center center;
          will-change: transform;
        }
        .hero-3d:hover .hero-3d__img {
          transform: scale(1.06);
          animation: hero3dFloat 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-3d:hover .hero-3d__img { animation: none; transform: scale(1.02); }
        }
      `}</style>
    </section>
  );
}
