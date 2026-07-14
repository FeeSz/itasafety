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

// The timestamp (in seconds) where the hand has left the frame and only the
// floating products remain. The loop returns here instead of rewinding to 0,
// so the entrance animation (hand entering) never repeats.
const LOOP_START_S = 7.5;

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const [ctaHovered, setCtaHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Video refs & state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  // loopingOpacity drives the 150ms micro-fade that masks the currentTime jump
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
  // Instead of loop={true} (which rewinds to 0s replaying the hand animation),
  // we watch currentTime and jump back to LOOP_START_S just before the end.
  // A 150ms opacity dip masks the single-frame discontinuity of the jump.
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (video.currentTime >= video.duration - 0.15) {
      // Micro-fade: briefly lower opacity so the currentTime cut is invisible
      setLoopingOpacity(0);
      video.currentTime = LOOP_START_S;
      video.play().catch(() => {});
      // Restore opacity after the browser has rendered the new frame
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

  // ── Mouse tilt for left text column ─────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tiltY = (x / rect.width - 0.5) * 12;
    const tiltX = -((y / rect.height - 0.5) * 12);
    setTilt({ x: tiltX, y: tiltY, active: true });
  };

  const handleMouseLeave = () => {
    setPaused(false);
    setTilt({ x: 0, y: 0, active: false });
  };

  const slide = SLIDES[i];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative isolate overflow-hidden bg-white touch-pan-y"
      aria-label="Banner principal"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-10 pt-32 md:grid-cols-2 md:gap-12 md:pb-24 md:pt-36">

        {/* ── Left: text content ────────────────────────────────────────────── */}
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

          <div
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to={slide.ctaPrimary.to}
              className="rounded-full bg-[#111111] px-7 py-3.5 text-[14px] font-bold text-white transition-all duration-150 hover:bg-[#374151] hover:scale-105 active:scale-95"
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              to={slide.ctaSecondary.to}
              className="rounded-full border border-[#E5E7EB] bg-white px-7 py-3.5 text-[14px] font-bold text-[#111111] transition-all duration-150 hover:border-[#111111] hover:scale-105 active:scale-95"
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
                <span className="text-[22px] font-extrabold text-[#111111]">{t.num}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: video (or static fallback for reduced-motion) ─────────── */}
        {/* No border, no shadow, no background, no card — the video IS the page.
            The tilt/perspective wrapper is kept light (no drop-shadow) so there
            is no visual frame around the video. object-fit: cover + w-full fills
            the column naturally without letterboxing. */}
        <div
          className="relative hidden md:flex items-center justify-center hero-3d__entrance-wrapper"
          style={{ perspective: "1000px" }}
        >
          <div
            className="w-full select-none"
            style={{
              // Light mouse-tilt only — no scale-up that would push the video
              // outside its column and no drop-shadow that creates a "card" halo
              transform: tilt.active
                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                : ctaHovered
                  ? "rotateX(2deg) rotateY(-4deg)"
                  : "rotateX(0deg) rotateY(0deg)",
              transition: tilt.active
                ? "transform 150ms ease-out"
                : "transform 600ms ease",
            }}
          >
            {isReducedMotion ? (
              /* ── Reduced-motion: static image, no animation ── */
              <img
                src={heroImg}
                alt="Equipamentos de proteção individual: capacete, óculos e luvas"
                width={1024}
                height={1024}
                fetchPriority="high"
                className="w-full object-contain"
                draggable={false}
              />
            ) : (
              /* ── Video: frameless, blends into white page background ──
                 • No border / border-radius / box-shadow on the element itself
                 • No mix-blend-multiply (was causing grey-cast letterboxing)
                 • autoPlay triggers the initial play; IntersectionObserver
                   handles pause/resume as the section enters/leaves viewport
                 • The micro-fade on loopingOpacity masks the currentTime jump */
              <video
                ref={videoRef}
                src="/videos/hero-loop.mp4"
                poster={heroImg}
                autoPlay
                muted
                playsInline
                preload="auto"
                // controls is omitted entirely — default is false for <video>
                onTimeUpdate={handleTimeUpdate}
                className="w-full object-contain"
                style={{
                  display: "block",
                  background: "transparent",
                  opacity: loopingOpacity,
                  transition: "opacity 80ms linear",
                }}
                aria-label="Animação de capacete, óculos de proteção e luvas flutuando"
              />
            )}
          </div>
        </div>

      </div>

      {/* ── CSS animations ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hero3dEntrance {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-3d__entrance-wrapper {
          animation: hero3dEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-3d__entrance-wrapper { animation: none; }
        }
      `}</style>
    </section>
  );
}
