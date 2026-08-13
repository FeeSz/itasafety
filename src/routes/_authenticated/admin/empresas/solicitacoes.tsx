import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  InboxIcon,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import { ListSkeleton } from "@/components/ui/Skeletons";

export const Route = createFileRoute("/_authenticated/admin/empresas/solicitacoes")({
  component: AdminSolicitacoesPage,
});

const CAMPO_LABELS: Record<string, string> = {
  razao_social: "Razão Social",
  cnpj: "CNPJ",
  telefone_contato: "Telefone",
  nome_contato: "Nome do Contato",
  endereco_cadastral: "Endereço Cadastral",
};

type RequestStatus = "pendente" | "aprovada" | "rejeitada";

type ChangeRequest = {
  id: string;
  empresa_id: string;
  user_id: string;
  campo_alterado: string;
  valor_atual: string | null;
  valor_proposto: string | null;
  status: RequestStatus;
  created_at: string;
  reviewed_at: string | null;
  empresas?: { razao_social: string; cnpj: string };
};

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "aprovada") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
      <CheckCircle2 className="size-3.5" /> Aprovado
    </span>
  );
  if (status === "rejeitada") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
      <XCircle className="size-3.5" /> Recusado
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
      <Clock className="size-3.5" /> Pendente
    </span>
  );
}

function AdminSolicitacoesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "todas">("pendente");
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-change-requests", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("empresa_change_requests")
        .select(`*, empresas(razao_social, cnpj)`)
        .order("created_at", { ascending: false });

      if (statusFilter !== "todas") {
        q = q.eq("status", statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as ChangeRequest[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("aprovar_change_request", { p_request_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alteração aprovada e aplicada na empresa!");
      qc.invalidateQueries({ queryKey: ["admin-change-requests"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Erro ao aprovar solicitação.")),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("empresa_change_requests")
        .update({ status: "rejeitada", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitação recusada.");
      setConfirmReject(null);
      qc.invalidateQueries({ queryKey: ["admin-change-requests"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Erro ao recusar solicitação.")),
  });

  const filterButtons: { id: RequestStatus | "todas"; label: string }[] = [
    { id: "pendente", label: "Pendentes" },
    { id: "aprovada", label: "Aprovadas" },
    { id: "rejeitada", label: "Recusadas" },
    { id: "todas", label: "Todas" },
  ];

  return (
    <section className="py-8">
      <Container className="max-w-4xl">
        <Reveal>
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="font-display text-xl font-black text-ink">Solicitações de Alteração</h1>
            <p className="text-sm text-ink-muted">Analise e aprove as solicitações de edição de dados de empresa.</p>
          </div>

          {/* Filtros */}
          <div className="mb-5 flex gap-1 rounded-xl border border-hairline bg-white p-1 shadow-card w-fit">
            {filterButtons.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  statusFilter === id
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lista */}
          {isLoading ? (
            <ListSkeleton />
          ) : !requests?.length ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-white py-16 text-center shadow-card">
              <InboxIcon className="size-10 text-ink-soft/40" />
              <p className="font-bold text-ink">Nenhuma solicitação encontrada</p>
              <p className="text-sm text-ink-muted">Não há solicitações com o filtro selecionado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
                  {/* Cabeçalho */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-blue-tint text-brand-blue">
                        <Building2 className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {req.empresas?.razao_social ?? "Empresa Desconhecida"}
                        </p>
                        <p className="text-xs text-ink-muted">{req.empresas?.cnpj ?? "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Diff */}
                  <div className="mt-4 rounded-xl border border-hairline bg-surface-sunken p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                      {CAMPO_LABELS[req.campo_alterado] ?? req.campo_alterado}
                    </p>
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 line-through">
                        {req.valor_atual ?? <span className="italic opacity-60">vazio</span>}
                      </div>
                      <span className="hidden text-ink-soft sm:block">→</span>
                      <div className="flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
                        {req.valor_proposto}
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <p className="mt-3 text-xs text-ink-soft">
                    Enviado em {new Date(req.created_at).toLocaleString("pt-BR")}
                    {req.reviewed_at && ` · Revisado em ${new Date(req.reviewed_at).toLocaleString("pt-BR")}`}
                  </p>

                  {/* Ações */}
                  {req.status === "pendente" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => approveMutation.mutate(req.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {approveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        Aprovar e aplicar
                      </button>

                      {confirmReject === req.id ? (
                        <>
                          <button
                            onClick={() => rejectMutation.mutate(req.id)}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {rejectMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                            Confirmar recusa
                          </button>
                          <button
                            onClick={() => setConfirmReject(null)}
                            className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold text-ink-muted transition hover:text-ink"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmReject(req.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                        >
                          <XCircle className="size-4" />
                          Recusar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
