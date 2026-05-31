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
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <Eyebrow>Erro 404</Eyebrow>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-ink md:text-6xl">
          Página não encontrada
        </h1>
        <p className="mt-4 text-sm text-ink-muted">
          O endereço acessado não existe ou foi movido.
        </p>
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
          <CtaButton as="a" href="/" variant="outline" size="sm">
            Início
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

const SITE_DESCRIPTION =
  "Distribuição de EPIs e consultoria técnica em segurança do trabalho — NR-06, NR-10, NR-35 e ISO 9001 para a indústria brasileira.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
      { title: "ITASAFETY - Equipamentos de Proteção Individual Ltda" },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:site_name", content: "ItaSafety" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "google-site-verification",
        content: "0Lcl1ACMKo_ErTp0ZMeCJVE9eh-d4pHxxsPUKes77Og",
      },
      { property: "og:title", content: "ITASAFETY - Equipamentos de Proteção Individual Ltda" },
      { name: "twitter:title", content: "ITASAFETY - Equipamentos de Proteção Individual Ltda" },
      { name: "description", content: "ItaSafety - Equipamentos de proteção individual. Fornecemos as melhores marcas com a melhor qualidade e toda atenção que nossos clientes merecem." },
      { property: "og:description", content: "ItaSafety - Equipamentos de proteção individual. Fornecemos as melhores marcas com a melhor qualidade e toda atenção que nossos clientes merecem." },
      { name: "twitter:description", content: "ItaSafety - Equipamentos de proteção individual. Fornecemos as melhores marcas com a melhor qualidade e toda atenção que nossos clientes merecem." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ab0672f-beb8-43f3-b9c9-967b0d2d7287/id-preview-aa10ea5d--da39f44e-909c-475c-b71a-c8842452812c.lovable.app-1780193247403.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ab0672f-beb8-43f3-b9c9-967b0d2d7287/id-preview-aa10ea5d--da39f44e-909c-475c-b71a-c8842452812c.lovable.app-1780193247403.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon-mark.png", type: "image/png" },
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
        <Toaster position="top-right" />
      </QuoteCartProvider>
    </QueryClientProvider>
  );
}
