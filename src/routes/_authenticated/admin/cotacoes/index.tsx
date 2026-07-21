import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ClipboardList, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cotacoes/")({
  component: AdminCotacoesListPage,
});

type StatusCotacao = "enviado" | "em_analise" | "respondido" | "devolvido";

type CotacaoRow = {
  id: string;
  numero_cotacao: number;
  empresa: string;
  nome_contato: string;
  email_contato: string;
  status: StatusCotacao;
  created_at: string;
  cotacao_notificacoes?: Array<{ status_envio: string }>;
};

const STATUS_META: Record<StatusCotacao, { label: string; cls: string }> = {
  enviado:    { label: "Enviado",    cls: "bg-blue-100 text-blue-700 border-blue-200" },
  em_analise: { label: "Em Análise", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  respondido: { label: "Respondido", cls: "bg-green-100 text-green-700 border-green-200" },
  devolvido:  { label: "Devolvido",  cls: "bg-red-100 text-red-700 border-red-200" },
};

const ALL_STATUS: StatusCotacao[] = ["enviado", "em_analise", "respondido", "devolvido"];

function AdminCotacoesListPage() {
  const { data: cotacoes, isLoading } = useQuery({
    queryKey: ["admin-cotacoes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cotacoes")
        .select(`
          id, numero_cotacao, empresa, nome_contato, email_contato,
          status, created_at,
          cotacao_notificacoes(status_envio)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CotacaoRow[];
    },
    refetchInterval: 30_000,
  });

  const counts = ALL_STATUS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = cotacoes?.filter((c) => c.status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Cotações Recebidas</h2>
          <p className="text-sm text-ink-muted mt-1">
            Gerencie as solicitações de cotação dos clientes.
          </p>
        </div>
      </div>

      {/* Contadores por status */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ALL_STATUS.map((s) => (
          <div
            key={s}
            className={`rounded-xl border px-4 py-3 ${STATUS_META[s].cls}`}
          >
            <p className="text-2xl font-bold">{counts[s]}</p>
            <p className="text-xs font-semibold opacity-80">{STATUS_META[s].label}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-ink-soft" />
        </div>
      ) : !cotacoes?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="size-10 text-ink-soft mb-3" />
          <p className="font-semibold text-ink-muted">Nenhuma cotação recebida ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-surface-sunken">
              <tr>
                {["Nº", "Empresa", "Contato", "Status", "Recebido em", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {cotacoes.map((c) => {
                const meta = STATUS_META[c.status] ?? STATUS_META["enviado"];
                const emailFalhou = c.cotacao_notificacoes?.some(
                  (n) => n.status_envio === "falhou"
                );
                return (
                  <tr key={c.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-blue">
                      #{String(c.numero_cotacao).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{c.empresa}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      <div>{c.nome_contato}</div>
                      <div className="text-xs">{c.email_contato}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                        {emailFalhou && (
                          <span title="E-mail não enviado">
                            <AlertTriangle className="size-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/admin/cotacoes/$id"
                        params={{ id: c.id }}
                        className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-all hover:bg-brand-blue hover:text-white hover:border-brand-blue"
                      >
                        Ver detalhes →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
