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
    ctaPrimary: { label: "Ver Catálogo", to: "/categorias" },
    ctaSecondary: { label: "Solicitar Cotação →", to: "/contato" },
  },
  {
    eyebrow: "Destaques da Semana",
    titleStart: "Equipamento certo. Trabalho seguro",
    titleEnd: ".",
    subtitle: "Os EPIs mais procurados pela engenharia de segurança.",
    ctaPrimary: { label: "Ver Destaques", to: "/departamento/protecao-visual" },
    ctaSecondary: { label: "Falar com Vendas →", to: "/contato" },
  },
  {
    eyebrow: "100% Certificado",
    titleStart: "Todo CA aprovado pelo MTE",
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
      className="relative isolate overflow-hidden bg-white"
      style={{ height: "520px" }}
      aria-label="Banner principal"
    >
      {/* Left image zone */}
      <div className="absolute inset-y-0 left-0 hidden w-[45%] md:block">
        <img
          src={heroImg}
          alt=""
          aria-hidden
          className="size-full object-cover object-center"
          fetchPriority="high"
        />
        {/* Decorative circle */}
        <div
          aria-hidden
          className="absolute z-0"
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "#F3F4F6",
            right: -60,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* Mobile background image (faded) */}
      <img
        src={heroImg}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-15 md:hidden"
      />

      {/* Right content zone */}
      <div
        className="absolute inset-y-0 right-0 z-10 flex w-full flex-col justify-center px-6 md:w-[55%]"
        style={{ paddingLeft: "5%", paddingRight: "8%" }}
      >
        <div key={i} className="max-w-xl animate-fade-in">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
            {slide.eyebrow}
          </p>
          <h1
            className="font-display text-[36px] font-extrabold leading-[1.1] text-[#111111] md:text-[48px]"
            style={{ marginBottom: 14 }}
          >
            {slide.titleStart}
            <span style={{ color: "#C0392B" }}>{slide.titleEnd}</span>
          </h1>
          <p className="mb-7 max-w-sm text-[15px] leading-relaxed text-[#6B7280]">
            {slide.subtitle}
          </p>
          <div className="flex flex-row items-center gap-4">
            <Link
              to={slide.ctaPrimary.to}
              className="rounded-md bg-[#111111] px-7 py-3 text-[13px] font-bold text-white transition-colors duration-150 hover:bg-[#374151]"
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              to={slide.ctaSecondary.to}
              className="text-[13px] font-semibold text-[#111111] underline underline-offset-[3px] transition-colors hover:text-[#1B4F8A]"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

          {/* Trust numbers */}
          <div className="mt-8 flex items-center">
            {TRUST.map((t, idx) => (
              <div
                key={t.label}
                className={`flex flex-col px-5 first:pl-0 ${
                  idx < TRUST.length - 1 ? "border-r border-[#E5E7EB]" : ""
                }`}
              >
                <span className="text-[20px] font-extrabold text-[#111111]">
                  {t.num}
                </span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div
        className="absolute z-10 flex gap-1.5"
        style={{ bottom: 18, left: "47%" }}
      >
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
            className="h-1 rounded-sm transition-all"
            style={{
              width: idx === i ? 22 : 7,
              background: idx === i ? "#111111" : "#D1D5DB",
            }}
          />
        ))}
      </div>
    </section>
  );
}
