import { ArrowRight } from "lucide-react";
import factoryWorker from "@/assets/landing-factory-worker.jpg";
import hardhatAndGloves from "@/assets/landing-hardhat-gloves.jpg";
import protectedWorker from "@/assets/landing-protected-worker.jpg";
import safetyGlasses from "@/assets/landing-safety-glasses.jpg";
import womanWithPpe from "@/assets/landing-woman-ppe.jpg";
import { appHref } from "@/components/landing/landing-data";
import { cn } from "@/lib/utils";

const REASONS = [
  {
    eyebrow: "Catálogo organizado",
    title: "Encontre a proteção certa para cada necessidade.",
    image: hardhatAndGloves,
    alt: "Capacete amarelo e luvas vermelhas de proteção",
    imageClass: "landing-reason-media--equipment",
    tone: "inverse",
  },
  {
    eyebrow: "Escolha mais clara",
    title: "Comece pelo tipo de proteção que sua equipe precisa.",
    image: safetyGlasses,
    alt: "Profissional segurando capacete e óculos de proteção",
    imageClass: "landing-reason-media--detail",
    tone: "default",
  },
  {
    eyebrow: "Atendimento para empresas",
    title: "Conte com nosso time para escolher com segurança.",
    image: womanWithPpe,
    alt: "Profissional usando capacete, óculos e luvas de proteção",
    imageClass: "landing-reason-media--portrait",
    tone: "inverse",
  },
  {
    eyebrow: "Seleção para cotação",
    title: "Reúna seus EPIs e solicite uma cotação de uma só vez.",
    image: protectedWorker,
    alt: "Profissional usando capacete, óculos e respirador",
    imageClass: "landing-reason-media--protected-worker",
    tone: "default",
  },
] as const;

export default function LandingReasons() {
  return (
    <section
      id="motivos"
      className="landing-reasons-section scroll-mt-4 py-20 sm:py-24 lg:py-28"
      aria-labelledby="landing-reasons-title"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-7 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="landing-reasons-title"
            className="max-w-3xl text-h1 font-semibold tracking-[-0.04em] text-[#1d1d1f]"
          >
            Motivos para escolher a ItaSafety.
          </h2>
          <a
            href={appHref("/catalogo")}
            className="focus-ring motion-colors inline-flex min-h-11 w-fit items-center gap-1 rounded-sm text-body-sm font-medium text-[#0066cc] hover:text-[#004f9e]"
          >
            Explorar catálogo
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </a>
        </div>

        <div className="landing-reasons-rail -mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 sm:-mx-7 sm:mt-14 sm:px-7 lg:-mx-8 lg:px-8 xl:mx-0 xl:px-0">
          {REASONS.map((reason) => (
            <article
              key={reason.eyebrow}
              className={cn(
                "landing-reason-card snap-start",
                reason.tone === "inverse"
                  ? "landing-reason-card--inverse text-white"
                  : "landing-reason-card--default text-[#1d1d1f]",
              )}
            >
              <img
                src={reason.image}
                alt={reason.alt}
                loading="lazy"
                decoding="async"
                className={cn("landing-reason-media", reason.imageClass)}
              />
              <div className="landing-reason-card__veil" aria-hidden />
              <div className="landing-reason-card__content">
                <p className="text-[15px] font-semibold leading-tight">{reason.eyebrow}</p>
                <h3 className="mt-3 max-w-[310px] text-[27px] font-semibold leading-[1.08] tracking-[-0.035em]">
                  {reason.title}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 sm:mt-24 lg:mt-28">
          <h3 className="max-w-4xl text-h1 font-semibold tracking-[-0.04em] text-[#1d1d1f]">
            Segurança em cada escolha.
          </h3>

          <article className="landing-safety-feature mt-10 text-white sm:mt-12">
            <img
              src={factoryWorker}
              alt="Profissional usando capacete, óculos e colete de alta visibilidade em uma fábrica"
              loading="lazy"
              decoding="async"
              className="landing-safety-feature__media"
            />
            <div className="landing-safety-feature__shade" aria-hidden />
            <div className="landing-safety-feature__content">
              <p className="max-w-[360px] text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[32px]">
                O EPI certo começa antes do risco.
              </p>
              <a
                href={appHref("/contato")}
                className="focus-ring-inverse motion-colors mt-7 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-body-sm font-semibold text-white hover:bg-primary-hover"
              >
                Falar com a equipe
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
