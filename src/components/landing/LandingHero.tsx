import { lazy, Suspense } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SafetyVisorPoster from "@/components/landing/SafetyVisorPoster";
import { appHref } from "@/components/landing/landing-data";
import { buttonVariants } from "@/components/ui/button.variants";
import { cn } from "@/lib/utils";

const SafetyVisorVisual = lazy(
  () => import("@/components/landing/SafetyVisorVisual"),
);

export default function LandingHero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[680px] scroll-mt-4 items-center overflow-hidden bg-background px-4 pb-20 pt-28 sm:min-h-[720px] sm:px-7 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
      aria-labelledby="landing-hero-title"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="grid items-center gap-12 xl:grid-cols-12 xl:gap-10">
          <div className="xl:col-span-7">
            <p className="text-label font-semibold tracking-[0.04em] text-primary">
              Proteção individual para empresas
            </p>

            <h1
              id="landing-hero-title"
              className="mt-5 max-w-[1040px] text-display font-semibold text-foreground"
            >
              Um acidente custa
              <span className="block text-brand-accent">muito mais que o EPI.</span>
            </h1>

            <p className="mt-8 max-w-[600px] text-body-lg text-foreground-muted sm:mt-9">
              Encontre o EPI certo para sua operação. Selecione, organize e peça sua cotação.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={appHref("/catalogo")}
                className={cn(buttonVariants({ size: "lg" }), "group min-w-[214px]")}
              >
                Explorar catálogo
                <ArrowRight
                  className="motion-transform size-5 group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </a>

              <a
                href={appHref("/contato")}
                className="focus-ring motion-colors group inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-body-sm font-semibold text-foreground-muted hover:text-primary"
              >
                Falar com a equipe
                <ArrowUpRight
                  className="motion-transform size-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
          </div>

          <div className="xl:col-span-5">
            <Suspense
              fallback={
                <div className="safety-visor safety-visor--fallback" aria-hidden>
                  <div className="safety-visor__stage">
                    <SafetyVisorPoster />
                  </div>
                </div>
              }
            >
              <SafetyVisorVisual />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
