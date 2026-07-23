import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { toast } from "sonner";
import { Building2, CheckCircle2, Clock, Loader2, XCircle, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/empresas/")({
  component: AdminEmpresasPage,
});

type EmpresaStatus = "pendente_aprovacao" | "aprovada" | "rejeitada";

type Empresa = {
  id: string;
  user_id: string;
  razao_social: string;
  cnpj: string;
  telefone_contato: string;
  nome_contato: string;
  endereco_cadastral: string | null;
  status: EmpresaStatus;
  created_at: string;
  // Join data (opcional, só para exibir email)
  users?: { email: string };
};

function AdminEmpresasPage() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmpresaStatus | "todas">("pendente_aprovacao");

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["admin-empresas", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("empresas")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (statusFilter !== "todas") {
        q = q.eq("status", statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Empresa[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: EmpresaStatus }) => {
      const { error } = await supabase
        .from("empresas")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status da empresa atualizado.");
      qc.invalidateQueries({ queryKey: ["admin-empresas"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar empresa");
    }
  });

  const filteredEmpresas = empresas?.filter(e => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.razao_social.toLowerCase().includes(term) ||
      e.cnpj.includes(term) ||
      e.nome_contato.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <section className="bg-surface-sunken pb-20 pt-24 min-h-screen">
      <Container>
        <Reveal>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-blue-tint text-brand-blue">
                  <Building2 className="size-5" />
                </div>
                <h1 className="font-display text-2xl font-black text-ink">Aprovação de Empresas</h1>
              </div>
              <p className="text-sm text-ink-muted max-w-xl">
                Controle o acesso das empresas para que elas possam enviar cotações na plataforma.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            {/* Filtros */}
            <div className="flex gap-2">
              {(["pendente_aprovacao", "aprovada", "rejeitada", "todas"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    statusFilter === status 
                      ? "bg-brand-blue text-white" 
                      : "bg-white border border-hairline text-ink-muted hover:bg-surface-sunken"
                  }`}
                >
                  {status === "todas" ? "Todas" : status === "pendente_aprovacao" ? "Pendentes" : status === "aprovada" ? "Aprovadas" : "Rejeitadas"}
                </button>
              ))}
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
              <input
                type="text"
                placeholder="Buscar por CNPJ ou nome..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-hairline bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredEmpresas?.map(empresa => (
              <div key={empresa.id} className="rounded-xl border border-hairline bg-white p-5 shadow-sm flex flex-col md:flex-row gap-5 justify-between md:items-center">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-ink">{empresa.razao_social}</h3>
                    {empresa.status === "pendente_aprovacao" && <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-bold">Pendente</span>}
                    {empresa.status === "aprovada" && <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-bold">Aprovada</span>}
                    {empresa.status === "rejeitada" && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold">Rejeitada</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
                    <span><strong>CNPJ:</strong> {empresa.cnpj}</span>
                    <span><strong>Contato:</strong> {empresa.nome_contato}</span>
                    <span><strong>Telefone:</strong> {empresa.telefone_contato}</span>
                    {empresa.endereco_cadastral && <span className="w-full mt-1 text-xs"><strong>Endereço:</strong> {empresa.endereco_cadastral}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 md:pt-0 border-t border-hairline md:border-t-0 md:border-l md:pl-5 shrink-0">
                  {empresa.status === "pendente_aprovacao" && (
                    <>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: empresa.id, status: "aprovada" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-4" /> Aprovar
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: empresa.id, status: "rejeitada" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="size-4" /> Rejeitar
                      </button>
                    </>
                  )}
                  {empresa.status === "aprovada" && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: empresa.id, status: "rejeitada" })}
                      disabled={updateStatusMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-sunken"
                    >
                      Revogar Acesso
                    </button>
                  )}
                  {empresa.status === "rejeitada" && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: empresa.id, status: "aprovada" })}
                      disabled={updateStatusMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-sunken"
                    >
                      Aprovar Acesso
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredEmpresas?.length === 0 && (
              <div className="rounded-xl border border-dashed border-hairline bg-surface-sunken p-12 text-center text-ink-muted">
                <Building2 className="mx-auto size-12 text-ink-soft opacity-50" />
                <p className="mt-4 font-semibold">Nenhuma empresa encontrada</p>
                <p className="mt-1 text-sm">Tente ajustar seus filtros de busca.</p>
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
