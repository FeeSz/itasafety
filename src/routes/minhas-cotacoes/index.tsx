import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Loader2, ClipboardList, ArrowRight, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/minhas-cotacoes/")({
  head: () =>
    pageMeta({
      title: "Minhas Cotações — ItaSafety",
      description: "Acompanhe o status das suas solicitações de cotação de EPIs.",
      path: "/minhas-cotacoes",
    }),
  component: MinhasCotacoesPage,
});

type StatusCotacao = "enviado" | "em_analise" | "respondido" | "devolvido";

type CotacaoRow = {
  id: string;
  numero_cotacao: number;
  empresa: string;
  status: StatusCotacao;
  created_at: string;
  cotacao_itens: Array<{ id: string }>;
};

const STATUS_META: Record<StatusCotacao, { label: string; icon: React.ReactNode; cls: string; dot: string }> = {
  enviado:    { label: "Enviado",    icon: <Clock className="size-3.5" />,        cls: "bg-blue-100 text-blue-700 border-blue-200",  dot: "bg-blue-400" },
  em_analise: { label: "Em Análise", icon: <Search className="size-3.5" />,       cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  respondido: { label: "Respondido", icon: <CheckCircle2 className="size-3.5" />, cls: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-400" },
  devolvido:  { label: "Devolvido",  icon: <XCircle className="size-3.5" />,      cls: "bg-red-100 text-red-700 border-red-200",      dot: "bg-red-400" },
};

function MinhasCotacoesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      // Same pattern used throughout the project (departamento.$slug, detalhes.$sku, etc.)
      // TS error on `to: "/auth"` without search is pre-existing project-wide
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: "/auth" } as any);
    }
  }, [user, loading, navigate]);

  const { data: cotacoes, isLoading } = useQuery({
    queryKey: ["minhas-cotacoes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cotacoes")
        .select("id, numero_cotacao, empresa, status, created_at, cotacao_itens(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CotacaoRow[];
    },
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Minhas Cotações</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Acompanhe o status das suas solicitações de cotação de EPIs.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-ink-soft" />
        </div>
      ) : !cotacoes?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-hairline bg-white py-16 text-center shadow-card">
          <ClipboardList className="size-12 text-ink-soft mb-3" />
          <p className="font-semibold text-ink">Nenhuma cotação enviada ainda.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Adicione EPIs ao carrinho e envie sua primeira solicitação.
          </p>
          <Link
            to="/categorias"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue/90 transition-colors"
          >
            Ver Produtos <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cotacoes.map((c) => {
            const meta = STATUS_META[c.status] ?? STATUS_META["enviado"];
            return (
              <Link
                key={c.id}
                to="/minhas-cotacoes/$id"
                params={{ id: c.id }}
                className="group flex items-center gap-4 rounded-xl border border-hairline bg-white p-4 shadow-card transition-all hover:border-brand-blue/30 hover:shadow-lift"
              >
                <div className={`size-2.5 rounded-full shrink-0 ${meta.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-blue text-sm">
                      #{String(c.numero_cotacao).padStart(4, "0")}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${meta.cls}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-ink truncate">{c.empresa}</p>
                  <p className="text-xs text-ink-muted">
                    {c.cotacao_itens.length} produto{c.cotacao_itens.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(c.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <ArrowRight className="size-4 text-ink-soft group-hover:text-brand-blue transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
