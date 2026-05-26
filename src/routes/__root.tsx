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

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-navy-deep px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-red">Erro 404</p>
        <h1 className="mt-4 font-display text-6xl font-black uppercase tracking-tighter text-white">
          Página não encontrada
        </h1>
        <p className="mt-4 text-sm text-white/60">
          O endereço acessado não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-brand-red px-6 py-3 font-display text-xs font-bold uppercase tracking-tighter text-white hover:bg-brand-red-dark"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-navy-deep px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-red">Erro</p>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter text-white">
          Esta página não carregou
        </h1>
        <p className="mt-4 text-sm text-white/60">
          Algo inesperado aconteceu. Tente novamente em instantes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-brand-red px-6 py-3 font-display text-xs font-bold uppercase tracking-tighter text-white hover:bg-brand-red-dark"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="border border-white/20 px-6 py-3 font-display text-xs font-bold uppercase tracking-tighter text-white hover:bg-white/5"
          >
            Início
          </a>
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
      { name: "theme-color", content: "#0A1229" },
      { title: "ItaSafety — EPI e Proteção Industrial Enterprise" },
      {
        name: "description",
        content:
          "Distribuição de equipamentos de proteção individual (EPI) e consultoria técnica em segurança do trabalho. Conformidade NR-06, NR-10, NR-35.",
      },
      { property: "og:title", content: "ItaSafety — EPI e Proteção Industrial Enterprise" },
      {
        property: "og:description",
        content:
          "Catálogo técnico de EPIs e soluções de segurança industrial para a indústria brasileira.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon-mark.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-brand-red focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-wider focus:text-white"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </QueryClientProvider>
  );
}
