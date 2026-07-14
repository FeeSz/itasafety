import { useEffect, useState, useRef } from "react";
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
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, active: false });
  const [ctaHovered, setCtaHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [loopingOpacity, setLoopingOpacity] = useState(1);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause video when off-screen
  useEffect(() => {
    if (isReducedMotion) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      });
    }, { threshold: 0.1 });

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, [isReducedMotion]);

  // Video loop logic
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const LOOP_START = 7.5; // Start loop slightly before the end to avoid the initial hand animation
    
    // If video reaches the very end
    if (video.currentTime >= video.duration - 0.1) {
      setLoopingOpacity(0.85); // Micro-fade to mask the cut
      video.currentTime = LOOP_START;
      video.play().catch(() => {});
      setTimeout(() => setLoopingOpacity(1), 150);
    }
  };

  // Auto rotate slides
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diffX > threshold) {
      // Swipe left -> next slide
      changeTo((i + 1) % SLIDES.length);
    } else if (diffX < -threshold) {
      // Swipe right -> previous slide
      changeTo((i - 1 + SLIDES.length) % SLIDES.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    // Max tilt 6 degrees
    const tiltY = (x / rect.width - 0.5) * 12; // -6 to 6
    const tiltX = -((y / rect.height - 0.5) * 12); // -6 to 6

    setTilt({ x: tiltX, y: tiltY, px, py, active: true });
  };

  const handleMouseLeave = () => {
    setPaused(false);
    setTilt({ x: 0, y: 0, px: 50, py: 50, active: false });
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

        {/* Right visual — transparent 3D with hover animation and Video */}
        <div
          className="hero-3d group relative hidden items-center justify-center md:flex hero-3d__entrance-wrapper"
          style={{ perspective: "1000px" }}
        >
          {/* Translation wrapper (breathing/idle is removed for video, as video has its own motion) */}
          <div className={`w-full max-w-[560px]`}>
            {/* Rotation/Tilt wrapper (mouse move & hover) */}
            <div
              className="relative w-full select-none"
              style={{
                transform: tilt.active
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${ctaHovered ? 1.08 : 1.04})`
                  : ctaHovered
                    ? "rotateX(4deg) rotateY(-8deg) scale(1.08)"
                    : "rotateX(0deg) rotateY(0deg) scale(1)",
                filter: ctaHovered
                  ? "drop-shadow(0 20px 50px rgba(27, 79, 138, 0.28))"
                  : "drop-shadow(0 30px 40px rgba(0, 0, 0, 0.18))",
                transition: tilt.active
                  ? "transform 150ms ease-out, filter 300ms ease"
                  : "transform 600ms ease, filter 300ms ease",
              }}
            >
              {isReducedMotion ? (
                <img
                  src={heroImg}
                  alt="Equipamentos de proteção individual"
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  className="w-full object-contain mix-blend-multiply"
                  draggable={false}
                />
              ) : (
                <video
                  ref={videoRef}
                  src="/videos/hero-loop.mp4"
                  poster={heroImg}
                  muted
                  playsInline
                  preload="auto"
                  controls={false}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full object-contain mix-blend-multiply transition-opacity duration-150"
                  style={{ opacity: loopingOpacity }}
                />
              )}

              {/* Dynamic Glint/Reflection clipped to image outline */}
              <div
                className={`absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300 ${
                  tilt.active ? "opacity-75" : "opacity-0"
                }`}
                style={{
                  background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 40%)`,
                  maskImage: `url(${heroImg})`,
                  WebkitMaskImage: `url(${heroImg})`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </div>
          </div>
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
        @keyframes hero3dEntrance {
          0% {
            opacity: 0;
            transform: scale(0.85) rotate(12deg) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0);
          }
        }
        .hero-3d__entrance-wrapper {
          animation: hero3dEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-3d__entrance-wrapper {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
