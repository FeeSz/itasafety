import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-industrial.jpg";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Catálogo Industrial",
    title: "Equipamentos de Proteção Individual",
    subtitle: "Qualidade certificada para a segurança do seu time.",
    ctaPrimary: { label: "Ver Catálogo Completo", to: "/departamento/calcados" },
    ctaSecondary: { label: "Solicitar Cotação", to: "/contato" },
  },
  {
    eyebrow: "Destaques da Semana",
    title: "Novidades em Proteção Visual e Respiratória",
    subtitle: "Os EPIs mais procurados pela engenharia de segurança.",
    ctaPrimary: { label: "Ver Destaques", to: "/departamento/protecao-visual" },
    ctaSecondary: { label: "Falar com Vendas", to: "/contato" },
  },
  {
    eyebrow: "100% Certificado",
    title: "Produtos com CA Aprovado pelo MTE",
    subtitle: "Todos os itens com Certificado de Aprovação ativo.",
    ctaPrimary: { label: "Ver Certificados", to: "/departamento/luvas" },
    ctaSecondary: { label: "Política de Qualidade", to: "/quemsomos" },
  },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const slide = SLIDES[i];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-active text-white"
      aria-label="Banner principal"
    >
      <img
        src={heroImg}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-25 mix-blend-overlay"
        fetchPriority="high"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-active/85 via-brand-blue/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-center px-6 py-16 md:min-h-[420px] md:py-24">
        <div key={i} className="max-w-2xl animate-fade-in">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
            {slide.eyebrow}
          </p>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:text-4xl md:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
            {slide.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to={slide.ctaPrimary.to}
              className="rounded-md bg-white px-6 py-3 text-sm font-bold text-brand-blue transition-all hover:scale-[1.03] hover:bg-brand-blue-tint"
            >
              {slide.ctaPrimary.label}
            </Link>
            {slide.ctaSecondary && (
              <Link
                to={slide.ctaSecondary.to}
                className="rounded-md border-2 border-white/80 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
              >
                {slide.ctaSecondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-md bg-black/40 px-3 py-2 text-xs backdrop-blur md:flex">
        <ShieldCheck className="size-4 text-brand-blue-light" />
        <span>Produtos com Certificado de Aprovação (CA)</span>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
