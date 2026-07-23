import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { toast } from "sonner";
import { Building2, CheckCircle2, Clock, Loader2, Save, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil/")({
  component: PerfilPage,
});

type EmpresaStatus = "pendente_aprovacao" | "aprovada" | "rejeitada";

type Empresa = {
  id: string;
  razao_social: string;
  cnpj: string;
  telefone_contato: string;
  nome_contato: string;
  endereco_cadastral: string | null;
  status: EmpresaStatus;
};

function PerfilPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [endereco, setEndereco] = useState("");

  const { data: empresa, isLoading } = useQuery({
    queryKey: ["empresa", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Empresa | null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (empresa) {
      setRazaoSocial(empresa.razao_social);
      setCnpj(empresa.cnpj);
      setTelefone(empresa.telefone_contato);
      setNomeContato(empresa.nome_contato);
      setEndereco(empresa.endereco_cadastral || "");
    } else if (user) {
      setNomeContato(user.user_metadata?.full_name || "");
    }
  }, [empresa, user]);

  const maskPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2 && val.length <= 6) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    else if (val.length > 6 && val.length < 11) val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
    else if (val.length === 11) val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    e.target.value = val;
    setTelefone(val);
  };

  const maskCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    let masked = digits;
    if (digits.length > 14) masked = digits.slice(0, 14);
    if (masked.length > 2) masked = `${masked.slice(0, 2)}.${masked.slice(2)}`;
    if (masked.length > 6) masked = `${masked.slice(0, 6)}.${masked.slice(6)}`;
    if (masked.length > 10) masked = `${masked.slice(0, 10)}/${masked.slice(10)}`;
    if (masked.length > 15) masked = `${masked.slice(0, 15)}-${masked.slice(15)}`;
    e.target.value = masked;
    setCnpj(masked);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      
      const payload = {
        user_id: user.id,
        razao_social: razaoSocial,
        cnpj,
        telefone_contato: telefone,
        nome_contato: nomeContato,
        endereco_cadastral: endereco || null,
        status: "pendente_aprovacao" as const, // Forçado pelo RLS também
      };

      if (empresa) {
        if (empresa.status !== "rejeitada") {
          throw new Error("Sua empresa já está cadastrada e em processamento.");
        }
        
        const { error } = await supabase
          .from("empresas")
          .update({
            razao_social: razaoSocial,
            cnpj,
            telefone_contato: telefone,
            nome_contato: nomeContato,
            endereco_cadastral: endereco || null,
            status: "pendente_aprovacao"
          })
          .eq("id", empresa.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresas").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Dados enviados com sucesso! Aguarde a aprovação.");
      qc.invalidateQueries({ queryKey: ["empresa", user?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao salvar empresa");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !cnpj || !telefone || !nomeContato) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <section className="bg-surface-sunken pb-20 pt-24 min-h-screen">
      <Container className="max-w-3xl">
        <Reveal>
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-brand-blue-tint text-brand-blue">
              <Building2 className="size-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-ink">Meu Perfil</h1>
              <p className="text-sm text-ink-muted">Gerencie os dados da sua empresa para solicitar cotações.</p>
            </div>
          </div>

          <div className="space-y-6">
            {empresa && (
              <div className={`flex items-start gap-3 rounded-xl border p-4 ${
                empresa.status === "aprovada" 
                  ? "bg-green-50 border-green-200 text-green-900" 
                  : empresa.status === "rejeitada"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
              }`}>
                {empresa.status === "aprovada" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-green-600 mt-0.5" />
                ) : empresa.status === "rejeitada" ? (
                  <XCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
                ) : (
                  <Clock className="size-5 shrink-0 text-amber-600 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {empresa.status === "aprovada" && "Cadastro Aprovado"}
                    {empresa.status === "rejeitada" && "Cadastro Rejeitado"}
                    {empresa.status === "pendente_aprovacao" && "Em Análise"}
                  </h3>
                  <p className="text-sm mt-1 opacity-90">
                    {empresa.status === "aprovada" && "Você já pode enviar cotações livremente."}
                    {empresa.status === "rejeitada" && "Seu cadastro não foi aprovado. Entre em contato com o suporte."}
                    {empresa.status === "pendente_aprovacao" && "Nossa equipe está revisando seus dados. Você poderá enviar cotações assim que for aprovado."}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-white p-6 sm:p-8 shadow-card space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-soft border-b border-hairline pb-3">
                Dados Cadastrais
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Razão Social / Nome da Empresa *</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    disabled={!!empresa && empresa.status !== "rejeitada"}
                    className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink">CNPJ *</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={maskCnpj}
                    disabled={!!empresa && empresa.status !== "rejeitada"}
                    placeholder="00.000.000/0000-00"
                    className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={maskPhone}
                    disabled={!!empresa && empresa.status !== "rejeitada"}
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink">Nome do Contato Principal *</label>
                  <input
                    type="text"
                    value={nomeContato}
                    onChange={(e) => setNomeContato(e.target.value)}
                    disabled={!!empresa && empresa.status !== "rejeitada"}
                    className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Endereço Cadastral (Opcional)</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    disabled={!!empresa && empresa.status !== "rejeitada"}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft transition-colors"
                  />
                </div>
              </div>

              {(!empresa || empresa.status === "rejeitada") && (
                <div className="flex justify-end pt-4 border-t border-hairline">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-50"
                  >
                    {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {empresa?.status === "rejeitada" ? "Reenviar Dados para Aprovação" : "Salvar Dados e Solicitar Aprovação"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
