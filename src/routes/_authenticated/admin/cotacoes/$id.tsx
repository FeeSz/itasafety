import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  Package,
  Send,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cotacoes/$id")({
  component: AdminCotacaoDetailPage,
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
  visualizado_em: string | null;
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
    status_novo: string;
    created_at: string;
  }>;
  cotacao_notificacoes: Array<{
    id: string;
    tipo: string;
    status_envio: string;
    erro: string | null;
    tentativas: number;
    updated_at: string;
  }>;
};

const STATUS_META: Record<StatusCotacao, { label: string; icon: React.ReactNode; cls: string }> = {
  enviado:    { label: "Enviado",    icon: <Clock className="size-4" />,        cls: "bg-blue-100 text-blue-700 border-blue-200" },
  em_analise: { label: "Em Análise", icon: <Loader2 className="size-4" />,      cls: "bg-amber-100 text-amber-700 border-amber-200" },
  respondido: { label: "Respondido", icon: <CheckCircle2 className="size-4" />, cls: "bg-green-100 text-green-700 border-green-200" },
  devolvido:  { label: "Devolvido",  icon: <XCircle className="size-4" />,      cls: "bg-red-100 text-red-700 border-red-200" },
};

function AdminCotacaoDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const markedRef = useRef(false);

  const [modo, setModo] = useState<"responder" | "devolver" | null>(null);
  const [proposta, setProposta] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reenvio, setReenvio] = useState(false);

  const { data: cotacao, isLoading } = useQuery({
    queryKey: ["admin-cotacao", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cotacoes")
        .select(`
          id, numero_cotacao, empresa, cnpj, nome_contato, email_contato,
          telefone, observacoes, status, proposta_mensagem, motivo_devolucao,
          visualizado_em, created_at,
          cotacao_itens(id, sku, nome, ca_number, quantidade, categoria, image_url),
          cotacao_historico_status(id, status_anterior, status_novo, created_at),
          cotacao_notificacoes(id, tipo, status_envio, erro, tentativas, updated_at)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as CotacaoDetalhe;
    },
  });

  // Transição automática Enviado → Em Análise ao abrir (guarda no banco)
  useEffect(() => {
    if (!cotacao || markedRef.current) return;
    if (cotacao.status !== "enviado") return;
    markedRef.current = true;

    (supabase as any)
      .rpc("marcar_em_analise", { _cotacao_id: id })
      .then(() => {
        qc.invalidateQueries({ queryKey: ["admin-cotacao", id] });
        qc.invalidateQueries({ queryKey: ["admin-cotacoes"] });
      });
  }, [cotacao, id, qc]);

  // Pré-preencher campos ao trocar de modo
  useEffect(() => {
    if (modo === "responder" && cotacao?.proposta_mensagem) {
      setProposta(cotacao.proposta_mensagem);
    }
    if (modo === "devolver" && cotacao?.motivo_devolucao) {
      setMotivo(cotacao.motivo_devolucao);
    }
  }, [modo, cotacao]);

  async function callEdgeFunction(body: object) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enviar-notificacao-cotacao`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
      }
    );
    return res.json();
  }

  async function handleResponder() {
    if (!proposta.trim()) {
      toast.error("Escreva a proposta antes de enviar.");
      return;
    }
    setEnviando(true);
    try {
      const result = await callEdgeFunction({
        cotacao_id: id,
        status_novo: "respondido",
        proposta_mensagem: proposta,
      });

      if (!result.ok) {
        toast.error(result.erro ?? "Erro ao responder cotação.");
        return;
      }

      toast.success("Proposta enviada com sucesso!");
      if (!result.email_enviado) {
        toast.warning(result.aviso ?? "E-mail não enviado — use 'Reenviar' no painel.");
      }
      setModo(null);
      qc.invalidateQueries({ queryKey: ["admin-cotacao", id] });
      qc.invalidateQueries({ queryKey: ["admin-cotacoes"] });
    } catch {
      toast.error("Falha na conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleDevolver() {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da devolução.");
      return;
    }
    setEnviando(true);
    try {
      const result = await callEdgeFunction({
        cotacao_id: id,
        status_novo: "devolvido",
        motivo_devolucao: motivo,
      });

      if (!result.ok) {
        toast.error(result.erro ?? "Erro ao devolver cotação.");
        return;
      }

      toast.success("Cotação devolvida.");
      if (!result.email_enviado) {
        toast.warning(result.aviso ?? "E-mail não enviado — use 'Reenviar' no painel.");
      }
      setModo(null);
      qc.invalidateQueries({ queryKey: ["admin-cotacao", id] });
      qc.invalidateQueries({ queryKey: ["admin-cotacoes"] });
    } catch {
      toast.error("Falha na conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleReenviarEmail() {
    setReenvio(true);
    try {
      const result = await callEdgeFunction({
        cotacao_id: id,
        apenas_email: true,
      });

      if (result.email_enviado) {
        toast.success("E-mail reenviado com sucesso!");
      } else {
        toast.error(result.aviso ?? "Falha no reenvio. Tente mais tarde.");
      }
      qc.invalidateQueries({ queryKey: ["admin-cotacao", id] });
    } catch {
      toast.error("Falha na conexão.");
    } finally {
      setReenvio(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (!cotacao) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center text-ink-muted">
        Cotação não encontrada.
      </div>
    );
  }

  const meta = STATUS_META[cotacao.status] ?? STATUS_META["enviado"];
  const emailFalhou = cotacao.cotacao_notificacoes?.some((n) => n.status_envio === "falhou");
  const isFinished = cotacao.status === "respondido" || cotacao.status === "devolvido";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/cotacoes"
            className="rounded-lg border border-hairline p-2 text-ink-muted hover:bg-surface-sunken transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-ink">
              Cotação #{String(cotacao.numero_cotacao).padStart(4, "0")}
            </h2>
            <p className="text-sm text-ink-muted">
              Recebida em{" "}
              {new Date(cotacao.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold ${meta.cls}`}>
          {meta.icon} {meta.label}
        </span>
      </div>

      {/* Banner: e-mail falhou */}
      {emailFalhou && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
            <span>
              <strong>Proposta salva, mas o e-mail não foi enviado ao cliente.</strong>{" "}
              Clique em "Reenviar" para tentar novamente.
            </span>
          </div>
          <button
            type="button"
            onClick={handleReenviarEmail}
            disabled={reenvio}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors shrink-0"
          >
            {reenvio ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
            Reenviar
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dados do cliente */}
          <section className="rounded-xl border border-hairline bg-white p-5 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Dados da Empresa
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoLine icon={<Building2 className="size-4" />} label="Empresa" value={cotacao.empresa} />
              <InfoLine icon={<Building2 className="size-4" />} label="CNPJ" value={cotacao.cnpj ?? "Não informado"} />
              <InfoLine icon={<User className="size-4" />} label="Contato" value={cotacao.nome_contato} />
              <InfoLine icon={<Phone className="size-4" />} label="Telefone" value={cotacao.telefone} />
              <InfoLine icon={<Mail className="size-4" />} label="E-mail" value={cotacao.email_contato} />
            </div>
            {cotacao.observacoes && (
              <div className="rounded-lg bg-surface-sunken p-3 text-sm text-ink-muted">
                <strong className="text-ink">Observações:</strong> {cotacao.observacoes}
              </div>
            )}
          </section>

          {/* Produtos solicitados */}
          <section className="rounded-xl border border-hairline bg-white p-5 shadow-card">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
              <span className="flex items-center gap-2">
                <Package className="size-4" />
                Produtos Solicitados ({cotacao.cotacao_itens.length})
              </span>
            </h3>
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
                    <p className="font-semibold text-ink truncate">{item.nome}</p>
                    <p className="text-xs text-ink-muted">
                      SKU: {item.sku}
                      {item.ca_number && ` · CA: ${item.ca_number}`}
                      {item.categoria && ` · ${item.categoria}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-blue-tint px-2.5 py-0.5 text-xs font-bold text-brand-blue">
                    Qtd: {item.quantidade}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Resposta atual (se já respondida/devolvida) */}
          {cotacao.status === "respondido" && cotacao.proposta_mensagem && (
            <section className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-700">
                Proposta Enviada
              </h3>
              <p className="whitespace-pre-wrap text-sm text-green-900">{cotacao.proposta_mensagem}</p>
            </section>
          )}
          {cotacao.status === "devolvido" && cotacao.motivo_devolucao && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">
                Motivo da Devolução
              </h3>
              <p className="whitespace-pre-wrap text-sm text-red-900">{cotacao.motivo_devolucao}</p>
            </section>
          )}

          {/* Formulário de resposta */}
          {!isFinished && (
            <section className="rounded-xl border border-hairline bg-white p-5 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Responder Cotação
              </h3>

              {modo === null && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModo("responder")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-blue/90 transition-colors"
                  >
                    <Send className="size-4" /> Enviar Proposta
                  </button>
                  <button
                    type="button"
                    onClick={() => setModo("devolver")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-brand-red/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-brand-red hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="size-4" /> Devolver Cotação
                  </button>
                </div>
              )}

              {modo === "responder" && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-ink">
                    Proposta Comercial
                  </label>
                  <textarea
                    value={proposta}
                    onChange={(e) => setProposta(e.target.value)}
                    rows={6}
                    placeholder="Ex.: Prezado cliente, segue proposta para os itens solicitados…&#10;&#10;Valor total estimado: R$ X.XXX,00&#10;Prazo de entrega: 5 dias úteis&#10;Condições de pagamento: 30/60 dias&#10;Validade da proposta: 7 dias"
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResponder}
                      disabled={enviando}
                      className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue/90 disabled:opacity-60 transition-colors"
                    >
                      {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      Confirmar Envio
                    </button>
                    <button
                      type="button"
                      onClick={() => setModo(null)}
                      className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-surface-sunken transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {modo === "devolver" && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-ink">
                    Motivo da Devolução <span className="text-brand-red">*</span>
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    placeholder="Ex.: Item indisponível em estoque · Fora da área de atendimento · Dados incompletos, por favor reenvie com CNPJ."
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDevolver}
                      disabled={enviando}
                      className="flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white hover:bg-brand-red/90 disabled:opacity-60 transition-colors"
                    >
                      {enviando ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                      Devolver Cotação
                    </button>
                    <button
                      type="button"
                      onClick={() => setModo(null)}
                      className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-surface-sunken transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Coluna lateral — Histórico */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-hairline bg-white p-5 shadow-card">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
              Linha do Tempo
            </h3>
            <ol className="relative border-l border-hairline space-y-4 pl-5">
              {[...cotacao.cotacao_historico_status]
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((h) => {
                  const sm = STATUS_META[h.status_novo as StatusCotacao] ?? STATUS_META["enviado"];
                  return (
                    <li key={h.id} className="relative">
                      <div className={`absolute -left-[21px] size-3 rounded-full border-2 border-white ring-2 ${sm.cls.includes("blue") ? "bg-blue-400 ring-blue-200" : sm.cls.includes("amber") ? "bg-amber-400 ring-amber-200" : sm.cls.includes("green") ? "bg-green-400 ring-green-200" : "bg-red-400 ring-red-200"}`} />
                      <p className="text-xs font-bold text-ink">{sm.label}</p>
                      <p className="text-xs text-ink-muted">
                        {new Date(h.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  );
                })}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink-soft shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
