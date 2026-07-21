import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import {
  Loader2,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/minhas-cotacoes/$id")({
  head: () =>
    pageMeta({
      title: "Acompanhar Cotação — ItaSafety",
      description: "Veja o status detalhado da sua solicitação de cotação.",
      path: "/minhas-cotacoes",
    }),
  component: MinhasCotacaoDetalhe,
});

type StatusCotacao = "enviado" | "em_analise" | "respondido" | "devolvido";

type CotacaoDetalhe = {
  id: string;
  numero_cotacao: number;
  empresa: string;
  cnpj: string | null;
  nome_contato: string;
  email_contato: string;
  telefone: string;
  observacoes: string | null;
  status: StatusCotacao;
  proposta_mensagem: string | null;
  motivo_devolucao: string | null;
  created_at: string;
  cotacao_itens: Array<{
    id: string;
    sku: string;
    nome: string;
    ca_number: string | null;
    quantidade: number;
    categoria: string | null;
    image_url: string | null;
  }>;
  cotacao_historico_status: Array<{
    id: string;
    status_anterior: string | null;
    status_novo: StatusCotacao;
    created_at: string;
  }>;
};

// Sequência lógica dos estados para a linha do tempo
const STATUS_SEQUENCE: StatusCotacao[] = ["enviado", "em_analise", "respondido"];

const STATUS_META: Record<
  StatusCotacao,
  { label: string; descricao: string; icon: React.ReactNode; cls: string; dotActive: string; dotInactive: string }
> = {
  enviado: {
    label: "Enviado",
    descricao: "Sua solicitação foi recebida e registrada.",
    icon: <Clock className="size-4" />,
    cls: "text-blue-700",
    dotActive: "bg-blue-500 ring-blue-200",
    dotInactive: "bg-slate-200",
  },
  em_analise: {
    label: "Em Análise",
    descricao: "Nossa equipe está revisando os itens solicitados.",
    icon: <Search className="size-4" />,
    cls: "text-amber-700",
    dotActive: "bg-amber-500 ring-amber-200",
    dotInactive: "bg-slate-200",
  },
  respondido: {
    label: "Respondido",
    descricao: "A proposta comercial foi enviada para o seu e-mail.",
    icon: <CheckCircle2 className="size-4" />,
    cls: "text-green-700",
    dotActive: "bg-green-500 ring-green-200",
    dotInactive: "bg-slate-200",
  },
  devolvido: {
    label: "Devolvido",
    descricao: "A cotação foi devolvida. Veja o motivo abaixo.",
    icon: <XCircle className="size-4" />,
    cls: "text-red-700",
    dotActive: "bg-red-500 ring-red-200",
    dotInactive: "bg-slate-200",
  },
};

function MinhasCotacaoDetalhe() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Same pattern used throughout the project (departamento.$slug, detalhes.$sku, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: "/auth" } as any);
    }
  }, [user, loading, navigate]);

  const { data: cotacao, isLoading } = useQuery({
    queryKey: ["minha-cotacao", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cotacoes")
        .select(`
          id, numero_cotacao, empresa, cnpj, nome_contato, email_contato,
          telefone, observacoes, status, proposta_mensagem, motivo_devolucao,
          created_at,
          cotacao_itens(id, sku, nome, ca_number, quantidade, categoria, image_url),
          cotacao_historico_status(id, status_anterior, status_novo, created_at)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as CotacaoDetalhe;
    },
  });

  if (loading || !user || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (!cotacao) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-ink-muted">Cotação não encontrada ou acesso negado.</p>
        <Link to="/minhas-cotacoes" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
          <ArrowLeft className="size-4" /> Voltar para minhas cotações
        </Link>
      </div>
    );
  }

  const isDevolvido = cotacao.status === "devolvido";

  // Quais etapas da linha do tempo mostrar e qual o progresso atual
  const timelineSteps = isDevolvido
    ? (["enviado", "em_analise", "devolvido"] as StatusCotacao[])
    : STATUS_SEQUENCE;

  // Índice do status atual na sequência da timeline
  const currentIdx = timelineSteps.indexOf(cotacao.status);

  // Mapear histórico por status para pegar timestamps
  const histByStatus = Object.fromEntries(
    cotacao.cotacao_historico_status.map((h) => [h.status_novo, h.created_at])
  );
  // O status "enviado" usa o created_at da própria cotação
  histByStatus["enviado"] = cotacao.created_at;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/minhas-cotacoes"
          className="rounded-lg border border-hairline p-2 text-ink-muted hover:bg-surface-sunken transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink">
            Cotação #{String(cotacao.numero_cotacao).padStart(4, "0")}
          </h1>
          <p className="text-sm text-ink-muted">
            Enviada em{" "}
            {new Date(cotacao.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Linha do tempo de status */}
      <section className="rounded-xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-ink-muted">
          Acompanhamento
        </h2>
        <ol className="relative flex flex-col gap-0">
          {timelineSteps.map((step, idx) => {
            const meta = STATUS_META[step];
            const isPast = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            const ts = histByStatus[step];

            return (
              <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Linha vertical conectora */}
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-6 h-full w-0.5 ${
                      isPast || isCurrent ? "bg-brand-blue/20" : "bg-slate-100"
                    }`}
                  />
                )}

                {/* Bolinha de status */}
                <div
                  className={`relative z-10 mt-0.5 size-6 shrink-0 rounded-full ring-4 flex items-center justify-center ${
                    isFuture
                      ? "bg-slate-100 ring-slate-50 text-ink-soft"
                      : isCurrent
                      ? `${meta.dotActive} ring-4 text-white`
                      : "bg-brand-blue ring-brand-blue/10 text-white"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : isCurrent ? (
                    <span className="size-2 rounded-full bg-white" />
                  ) : (
                    <span className="size-2 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className={`flex-1 ${isFuture ? "opacity-40" : ""}`}>
                  <p className={`font-semibold text-sm ${isCurrent ? meta.cls : isPast ? "text-ink" : "text-ink-muted"}`}>
                    {meta.label}
                    {isCurrent && (
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-current/10`}>
                        Atual
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{meta.descricao}</p>
                  {ts && !isFuture && (
                    <p className="text-xs text-ink-soft mt-1">
                      {new Date(ts).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Proposta recebida */}
      {cotacao.status === "respondido" && cotacao.proposta_mensagem && (
        <section className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-700">
            Proposta Comercial
          </h2>
          <p className="whitespace-pre-wrap text-sm text-green-900 leading-relaxed">
            {cotacao.proposta_mensagem}
          </p>
          <p className="mt-3 text-xs text-green-700">
            Em caso de dúvidas, entre em contato pelo e-mail ou WhatsApp informados no rodapé do site.
          </p>
        </section>
      )}

      {/* Motivo de devolução */}
      {cotacao.status === "devolvido" && cotacao.motivo_devolucao && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">
            Motivo da Devolução
          </h2>
          <p className="whitespace-pre-wrap text-sm text-red-900 leading-relaxed">
            {cotacao.motivo_devolucao}
          </p>
          <Link
            to="/contato"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
          >
            Entrar em contato →
          </Link>
        </section>
      )}

      {/* Produtos solicitados */}
      <section className="rounded-xl border border-hairline bg-white p-5 shadow-card">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
          <Package className="size-4" />
          Produtos Solicitados ({cotacao.cotacao_itens.length})
        </h2>
        <div className="divide-y divide-hairline">
          {cotacao.cotacao_itens.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.nome}
                  className="size-12 rounded-lg object-contain border border-hairline shrink-0"
                />
              ) : (
                <div className="size-12 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0">
                  <Package className="size-5 text-ink-soft" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{item.nome}</p>
                <p className="text-xs text-ink-muted">
                  SKU: {item.sku}
                  {item.ca_number && ` · CA: ${item.ca_number}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold text-ink-muted">
                × {item.quantidade}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dados do pedido */}
      <section className="rounded-xl border border-hairline bg-white p-5 shadow-card">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
          Dados do Pedido
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="size-4 text-ink-soft mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-ink-muted">Empresa</p>
              <p className="font-semibold text-ink">{cotacao.empresa}</p>
            </div>
          </div>
          {cotacao.cnpj && (
            <div className="flex items-start gap-2">
              <Building2 className="size-4 text-ink-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-ink-muted">CNPJ</p>
                <p className="font-semibold text-ink">{cotacao.cnpj}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Mail className="size-4 text-ink-soft mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-ink-muted">E-mail</p>
              <p className="font-semibold text-ink">{cotacao.email_contato}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="size-4 text-ink-soft mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-ink-muted">Telefone</p>
              <p className="font-semibold text-ink">{cotacao.telefone}</p>
            </div>
          </div>
        </div>
        {cotacao.observacoes && (
          <div className="mt-3 rounded-lg bg-surface-sunken p-3 text-sm text-ink-muted">
            <strong className="text-ink">Observações: </strong>
            {cotacao.observacoes}
          </div>
        )}
      </section>
    </div>
  );
}
