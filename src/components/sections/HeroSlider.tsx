import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
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
const LOOP_START_S = 7.5;

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Video refs & state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [loopingOpacity, setLoopingOpacity] = useState(1);

  // ── Prefers-reduced-motion ──────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── IntersectionObserver — pause when hero scrolls off screen ───────────────
  useEffect(() => {
    if (isReducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 },
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isReducedMotion]);

  // ── Seamless loop logic ─────────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (video.currentTime >= video.duration - 0.15) {
      setLoopingOpacity(0);
      video.currentTime = LOOP_START_S;
      video.play().catch(() => {});
      requestAnimationFrame(() => {
        setTimeout(() => setLoopingOpacity(1), 50);
      });
    }
  };

  // ── Slide auto-rotate ───────────────────────────────────────────────────────
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

  // ── Touch swipe ─────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) changeTo((i + 1) % SLIDES.length);
    else if (diff < -50) changeTo((i - 1 + SLIDES.length) % SLIDES.length);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slide = SLIDES[i];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Min height ensures the section is tall enough even without the grid layout
      className="relative isolate overflow-hidden bg-white touch-pan-y min-h-[700px] flex items-center"
      aria-label="Banner principal"
    >
      {/* ── Background Video Layer ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-white">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            // Scale up slightly to crop out the bottom-right watermark
            // and shift it very slightly down/right to push it out of bounds
            transform: "scale(1.06) translate(1%, 1%)",
          }}
        >
          {isReducedMotion ? (
            <img
              src={heroImg}
              alt="Equipamentos de proteção individual"
              fetchPriority="high"
              className="w-full h-full object-cover"
              style={{ objectPosition: "80% center" }}
              draggable={false}
            />
          ) : (
            <video
              ref={videoRef}
              src="/videos/hero-loop.mp4"
              poster={heroImg}
              autoPlay
              muted
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
              style={{
                objectPosition: "80% center", // Keep the right side focused
                opacity: loopingOpacity,
                transition: "opacity 80ms linear",
              }}
              aria-label="Animação de capacete, óculos de proteção e luvas flutuando"
            />
          )}
        </div>

        {/* ── Legibility Gradient Overlay ────────────────────────────────────── */}
        {/* Fades from solid white on the left (behind text) to transparent on the right (over products) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/85 to-transparent w-full md:w-2/3" />
        
        {/* Extra fallback patch just in case the scale isn't enough for very tall screens */}
        {/* Positioned at the very bottom right, blends with white background */}
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none bg-gradient-to-tl from-white via-white/50 to-transparent z-0 opacity-80 mix-blend-screen" />
      </div>

      {/* ── Foreground Content Layer ───────────────────────────────────────── */}
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 pb-10 pt-32 md:pb-24 md:pt-36 flex">
        <div
          className="w-full max-w-xl"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
          }}
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-semibold text-[#374151] shadow-sm">
            <span className="size-2 rounded-full bg-[#C0392B]" />
            {slide.eyebrow}
          </span>

          <h1 className="mt-6 font-display text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#111111] md:text-[56px] drop-shadow-sm">
            {slide.titleStart}
            <span className="text-[#C0392B]">{slide.titleAccent}</span>
            {slide.titleEnd}
          </h1>

          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#4B5563] font-medium drop-shadow-sm">
            {slide.subtitle}
          </p>

          <div
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to={slide.ctaPrimary.to}
              className="rounded-full bg-[#111111] px-7 py-3.5 text-[14px] font-bold text-white transition-all duration-150 hover:bg-[#374151] hover:scale-105 active:scale-95 shadow-md"
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              to={slide.ctaSecondary.to}
              className="rounded-full border border-[#E5E7EB] bg-white px-7 py-3.5 text-[14px] font-bold text-[#111111] transition-all duration-150 hover:border-[#111111] hover:scale-105 active:scale-95 shadow-sm"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          {/* Trust numbers */}
          <div className="mt-12 flex items-center">
            {TRUST.map((t, idx) => (
              <div
                key={t.label}
                className={`flex flex-col px-6 first:pl-0 ${
                  idx < TRUST.length - 1 ? "border-r border-[#E5E7EB]" : ""
                }`}
              >
                <span className="text-[22px] font-extrabold text-[#111111]">{t.num}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#6B7280] font-bold mt-0.5">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide Controls (Bottom Left aligned to container) ─────────────── */}
      <div className="absolute bottom-8 left-0 w-full pointer-events-none z-10">
        <div className="mx-auto max-w-7xl px-6 flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeTo((i - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Slide anterior"
              className="grid size-9 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#111111] transition-all hover:border-[#111111] hover:scale-105 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              type="button"
              onClick={() => changeTo((i + 1) % SLIDES.length)}
              aria-label="Próximo slide"
              className="grid size-9 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#111111] transition-all hover:border-[#111111] hover:scale-105 shadow-sm"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
      </div>
    </section>
  );
}
