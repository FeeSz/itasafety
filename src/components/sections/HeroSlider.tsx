import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";

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
const LOOP_START_TIME = 7.5; // Adjusted to match the zero-gravity float
const CROSSFADE_DURATION = 400; // ms
// Using the exact video filename provided in the prompt
const VIDEO_SRC = "/videos/hero-loop.mp4";
const FALLBACK_IMG = "/videos/hero-fallback-frame.jpg";

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // ── States for Video Background ─────────────────────────────────────────────
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  // ── Ensure video shows up if already cached ───────────────────────────────
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsVideoReady(true);
    }
  }, []);

  // ── Prefers-reduced-motion Detection ────────────────────────────────────────
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // ── Autoplay Blocked Fallback ───────────────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const video = videoRef.current;
    if (!video) return;

    // We explicitly try to play to catch autoplay rejections (Safari iOS / Low Power Mode)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error: Error) => {
        // AbortError simply means a pause() interrupted the play(), it's not a real autoplay failure
        if (error.name !== "AbortError") {
          console.warn("Hero Video autoplay was blocked by the browser.", error);
          setHasVideoError(true);
        }
      });
    }
  }, [prefersReducedMotion]);

  // ── Intersection Observer (Performance) ─────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion || hasVideoError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const current = activeVideo === 'A' ? videoRef.current : videoRefB.current;
            current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
            videoRefB.current?.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("hero-section");
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion, hasVideoError, activeVideo]);

  // ── Crossfade Loop Logic ────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion || hasVideoError) return;

    const current = activeVideo === 'A' ? videoRef.current : videoRefB.current;
    const next = activeVideo === 'A' ? videoRefB.current : videoRef.current;
    if (!current || !next) return;

    const handleTimeUpdate = () => {
      // Trigger the crossfade slightly before the end of the video
      if (current.duration && current.currentTime >= current.duration - 0.4) {
        next.currentTime = LOOP_START_TIME;
        next.play().catch(() => {});
        setActiveVideo(activeVideo === 'A' ? 'B' : 'A');
      }
    };

    current.addEventListener("timeupdate", handleTimeUpdate);
    return () => current.removeEventListener("timeupdate", handleTimeUpdate);
  }, [activeVideo, prefersReducedMotion, hasVideoError]);

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
      id="hero-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Strictly relative container. No isolate, no absolute fixed positioning.
      // Starts naturally below the header.
      className="relative overflow-hidden bg-[#FFFFFF] touch-pan-y min-h-[700px] flex items-center"
      aria-label="Banner principal"
    >
      {/* ── Background Layer (z-index 0) ─────────────────────────────────────── */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden" 
        style={{ zIndex: 0, backgroundColor: "#FFFFFF" }}
      >
        {/* Render fallback image if reduced motion OR video error/blocked */}
        {(prefersReducedMotion || hasVideoError) ? (
          <img
            src={FALLBACK_IMG}
            alt="Equipamentos de proteção individual"
            className="absolute top-0 left-0 w-full h-full"
            style={{ objectFit: "cover", objectPosition: "80% center" }}
            onError={(e) => {
              // If the fallback image doesn't exist, just hide it so it stays white
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          /* Video container with smooth fade-in after onCanPlay */
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: isVideoReady ? 1 : 0,
              transition: "opacity 400ms ease-in-out",
            }}
          >
            {/* VIDEO A */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoReady(true)}
              onError={() => setHasVideoError(true)}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: "80% 35%", // Shift upward slightly to reveal top of helmet
                opacity: activeVideo === 'A' ? 1 : 0,
                transition: `opacity ${CROSSFADE_DURATION}ms linear`,
              }}
              aria-label="Animação flutuante"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>

            {/* VIDEO B (For Crossfade) */}
            <video
              ref={videoRefB}
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoReady(true)}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: "80% 35%",
                opacity: activeVideo === 'B' ? 1 : 0,
                transition: `opacity ${CROSSFADE_DURATION}ms linear`,
              }}
              aria-hidden="true"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          </div>
        )}

        {/* Legibility Gradient Overlay (ensures text is readable over the video) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF]/85 to-transparent w-full md:w-2/3" />
      </div>

      {/* ── Foreground Content Layer (z-index 10) ──────────────────────────── */}
      <div className="relative w-full mx-auto max-w-7xl px-6 pb-10 pt-12 md:pb-24 md:pt-16 flex" style={{ zIndex: 10 }}>
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

      {/* ── Slide Controls ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 w-full pointer-events-none" style={{ zIndex: 10 }}>
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
