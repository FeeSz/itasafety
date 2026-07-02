import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import Header from "@/components/layout/Header";

import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import CtaButton from "@/components/ui/CtaButton";
import Eyebrow from "@/components/ui/Eyebrow";
import { QuoteCartProvider } from "@/components/quote/QuoteCartContext";
import QuoteFab from "@/components/quote/QuoteFab";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

const publicAsset = (assetPath: string) =>
  `${import.meta.env.BASE_URL}${assetPath.replace(/^\/+/, "")}`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <Eyebrow>Erro 404</Eyebrow>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-ink md:text-6xl">
          Página não encontrada
        </h1>
        <p className="mt-4 text-sm text-ink-muted">O endereço acessado não existe ou foi movido.</p>
        <CtaButton as={Link} to="/" size="sm" className="mt-8">
          Voltar ao início
        </CtaButton>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <Eyebrow>Erro</Eyebrow>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
          Esta página não carregou
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          Algo inesperado aconteceu. Tente novamente em instantes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <CtaButton
            size="sm"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </CtaButton>
          <CtaButton as={Link} to="/" variant="outline" size="sm">
            Início
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:site_name", content: "ItaSafety" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "google-site-verification",
        content: "0Lcl1ACMKo_ErTp0ZMeCJVE9eh-d4pHxxsPUKes77Og",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: publicAsset("favicon-mark.png"), type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QuoteCartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-brand-blue focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:text-white"
          >
            Ir para o conteúdo
          </a>
          <Header />
          <main id="main">
            <Outlet />
          </main>
          <Footer />
          <CookieBanner />
          <QuoteFab />
          <WhatsAppFab />
          <Toaster position="top-right" />
        </QuoteCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
