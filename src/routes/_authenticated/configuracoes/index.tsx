import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Bell,
  Building2,
  Upload,
  Loader2,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { User as SupabaseUser, UserAttributes } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/utils";
import { ListSkeleton } from "@/components/ui/Skeletons";

export const Route = createFileRoute("/_authenticated/configuracoes/")({
  component: ConfiguracoesPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type EmpresaStatus = "pendente_aprovacao" | "aprovada" | "rejeitada";

type Empresa = {
  id: string;
  razao_social: string;
  cnpj: string;
  telefone_contato: string;
  nome_contato: string;
  endereco_cadastral: string | null;
  logo_url: string | null;
  status: EmpresaStatus;
};

type EditableEmpresaField = keyof Pick<
  Empresa,
  "razao_social" | "cnpj" | "telefone_contato" | "nome_contato" | "endereco_cadastral"
>;

type ChangeRequest = {
  id: string;
  campo_alterado: string;
  valor_atual: string | null;
  valor_proposto: string | null;
  status: "pendente" | "aprovada" | "rejeitada";
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAMPO_LABELS: Record<EditableEmpresaField, string> = {
  razao_social: "Razão Social",
  cnpj: "CNPJ",
  telefone_contato: "Telefone",
  nome_contato: "Nome do Contato",
  endereco_cadastral: "Endereço Cadastral",
};
const EDITABLE_FIELDS = Object.entries(CAMPO_LABELS) as Array<
  [EditableEmpresaField, string]
>;

function getCampoLabel(campo: string) {
  return campo in CAMPO_LABELS
    ? CAMPO_LABELS[campo as EditableEmpresaField]
    : campo;
}

function maskPhone(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6 && v.length < 11) return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  if (v.length === 11) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`;
  return v;
}

function maskCnpj(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 14);
  if (v.length > 12) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
  if (v.length > 8)  return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
  if (v.length > 5)  return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
  if (v.length > 2)  return `${v.slice(0,2)}.${v.slice(2)}`;
  return v;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, description, icon: Icon, children }: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-hairline bg-surface-sunken px-6 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-blue-tint text-brand-blue">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-ink">{title}</h2>
          <p className="text-xs text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, id, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-ink">
        {label}{required && <span className="ml-0.5 text-brand-red">*</span>}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-blue disabled:bg-surface-sunken disabled:text-ink-soft"
      />
    </div>
  );
}

// ─── Bloco 1A: Dados da Conta ─────────────────────────────────────────────────

function BlocoDadosConta({ user }: { user: SupabaseUser }) {
  const [nome, setNome] = useState(user?.user_metadata?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates: UserAttributes = {
        data: { full_name: nome },
      };
      if (email !== user.email) {
        updates.email = email;
      }
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      if (email !== user.email) {
        toast.success("Confirmação enviada para o novo e-mail. Verifique sua caixa de entrada.", { duration: 7000 });
      } else {
        toast.success("Nome atualizado com sucesso!");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao atualizar dados."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <InputField
        id="cfg-nome"
        label="Nome completo"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <div className="space-y-1.5">
        <InputField
          id="cfg-email"
          label="E-mail"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email !== user.email && (
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <AlertTriangle className="size-3.5 shrink-0" />
            Será enviado um link de confirmação para o novo e-mail antes de ser alterado.
          </p>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue-hover disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Salvar dados
        </button>
      </div>
    </form>
  );
}

// ─── Bloco 1B: Alteração de Senha ─────────────────────────────────────────────

function BlocoAlterarSenha() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (next.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setSaving(true);
    try {
      // Supabase Auth não requer a senha atual no updateUser, mas precisamos
      // re-autenticar para garantir que o usuário é quem diz ser.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Usuário sem e-mail associado.");

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      if (signInErr) throw new Error("Senha atual incorreta.");

      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao alterar senha."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <InputField id="cfg-senha-atual" label="Senha atual" required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <InputField id="cfg-senha-nova" label="Nova senha" required type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Mínimo 8 caracteres" />
      <InputField id="cfg-senha-confirm" label="Confirmar nova senha" required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || !current || !next || !confirm}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue-hover disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          Alterar senha
        </button>
      </div>
    </form>
  );
}

// ─── Bloco 1C: Preferências de Notificação ────────────────────────────────────

function BlocoNotificacoes() {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3">
        <div className="relative flex items-center">
          <input type="checkbox" defaultChecked className="peer size-4 rounded border-hairline accent-brand-blue" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">E-mail</p>
          <p className="text-xs text-ink-muted">Receba atualizações de cotações por e-mail.</p>
        </div>
      </label>
      <label className="flex cursor-not-allowed items-center gap-3 opacity-50">
        <input type="checkbox" disabled className="size-4 rounded border-hairline" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">WhatsApp</p>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">Em breve</span>
          </div>
          <p className="text-xs text-ink-muted">Notificações via WhatsApp Business (em desenvolvimento).</p>
        </div>
      </label>
    </div>
  );
}

// ─── Bloco 2: Perfil da Empresa ───────────────────────────────────────────────

function BlocoPerfilEmpresa({ empresa, refetchEmpresa }: { empresa: Empresa; refetchEmpresa: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fieldEditing, setFieldEditing] = useState<EditableEmpresaField | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const { data: requests } = useQuery({
    queryKey: ["change-requests", empresa.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresa_change_requests")
        .select("*")
        .eq("empresa_id", empresa.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ChangeRequest[];
    },
    enabled: empresa.status === "aprovada",
  });

  // Campos pendentes por nome
  const pendingFields = new Set(
    (requests ?? []).filter((r) => r.status === "pendente").map((r) => r.campo_alterado)
  );

  // Upload de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A logo deve ter no máximo 2 MB.");
      return;
    }
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("empresa_logos")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("empresa_logos").getPublicUrl(path);
      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: rpcErr } = await supabase.rpc("atualizar_logo_empresa", { p_logo_url: logoUrl });
      if (rpcErr) throw rpcErr;

      toast.success("Logo atualizada com sucesso!");
      refetchEmpresa();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao enviar logo."));
    } finally {
      setUploadingLogo(false);
    }
  };

  // Iniciar edição de campo
  const startEdit = (campo: EditableEmpresaField) => {
    const current = empresa[campo] ?? "";
    setFieldValue(current);
    setFieldEditing(campo);
  };

  const cancelEdit = () => {
    setFieldEditing(null);
    setFieldValue("");
  };

  // Submeter change request
  const submitRequest = async () => {
    if (!fieldEditing || !user) return;
    const currentVal = empresa[fieldEditing] ?? "";
    if (fieldValue === currentVal) {
      toast.error("O novo valor é idêntico ao atual.");
      return;
    }
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from("empresa_change_requests").insert({
        empresa_id: empresa.id,
        user_id: user.id,
        campo_alterado: fieldEditing,
        valor_atual: currentVal || null,
        valor_proposto: fieldValue,
        status: "pendente",
      });
      if (error) {
        // Unique constraint violation → já existe pendente
        if (error.code === "23505") {
          toast.error("Já existe uma solicitação pendente para esse campo. Aguarde a análise.");
        } else {
          throw error;
        }
        return;
      }
      toast.success(`Solicitação de alteração de "${CAMPO_LABELS[fieldEditing]}" enviada para revisão.`);
      qc.invalidateQueries({ queryKey: ["change-requests", empresa.id] });
      cancelEdit();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao enviar solicitação."));
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center gap-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-sunken">
          {empresa.logo_url ? (
            <img src={empresa.logo_url} alt="Logo da empresa" className="size-full object-contain p-1" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Building2 className="size-8 text-ink-soft" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-ink">Logo da Empresa</p>
          <p className="mt-0.5 text-xs text-ink-muted">PNG ou JPG, máximo 2 MB. Reflecte imediatamente.</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingLogo}
            className="mt-2 flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
          >
            {uploadingLogo ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {uploadingLogo ? "Enviando…" : "Alterar logo"}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
        </div>
      </div>

      <div className="border-t border-hairline" />

      {/* Campos com change request */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          Dados cadastrais — alterações passam por aprovação
        </p>

        {EDITABLE_FIELDS.map(([campo, label]) => {
          const currentVal = empresa[campo] ?? "—";
          const isPending = pendingFields.has(campo);
          const isEditing = fieldEditing === campo;
          const pendingReq = (requests ?? []).find((r) => r.campo_alterado === campo && r.status === "pendente");

          return (
            <div key={campo} className={`rounded-xl border p-4 transition-colors ${
              isEditing ? "border-brand-blue/40 bg-brand-blue-tint/30" : "border-hairline bg-white"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink-soft">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink">{currentVal}</p>
                  {isPending && pendingReq && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                      <Clock className="size-3.5 shrink-0" />
                      <span>Aguardando aprovação: <strong>"{pendingReq.valor_proposto}"</strong></span>
                    </div>
                  )}
                </div>
                {!isEditing && !isPending && (
                  <button
                    type="button"
                    onClick={() => startEdit(campo)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-bold text-ink-muted transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    Solicitar alteração
                    <ChevronRight className="size-3.5" />
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="mt-4 space-y-3">
                  <input
                    type={campo === "telefone_contato" ? "tel" : "text"}
                    value={fieldValue}
                    onChange={(e) => {
                      if (campo === "telefone_contato") setFieldValue(maskPhone(e.target.value));
                      else if (campo === "cnpj") setFieldValue(maskCnpj(e.target.value));
                      else setFieldValue(e.target.value);
                    }}
                    placeholder={`Novo valor para ${label}`}
                    className="w-full rounded-lg border border-brand-blue/40 px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitRequest}
                      disabled={submittingRequest || !fieldValue}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-blue-hover disabled:opacity-50"
                    >
                      {submittingRequest ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                      Enviar para aprovação
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-hairline px-4 py-2 text-xs font-bold text-ink-muted transition hover:border-ink-soft hover:text-ink"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico de solicitações */}
      {(requests ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Histórico de solicitações</p>
          <div className="divide-y divide-hairline rounded-xl border border-hairline overflow-hidden">
            {requests!.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white px-4 py-3">
                {r.status === "aprovada" && <CheckCircle2 className="size-4 shrink-0 text-green-600" />}
                {r.status === "rejeitada" && <XCircle className="size-4 shrink-0 text-red-500" />}
                {r.status === "pendente" && <Clock className="size-4 shrink-0 text-amber-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {getCampoLabel(r.campo_alterado)}:{" "}
                    <span className="text-ink-muted">{r.valor_atual ?? "—"}</span>
                    {" → "}
                    <span className="font-bold">{r.valor_proposto}</span>
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  r.status === "aprovada" ? "bg-green-50 text-green-700" :
                  r.status === "rejeitada" ? "bg-red-50 text-red-700" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {r.status === "aprovada" ? "Aprovado" : r.status === "rejeitada" ? "Recusado" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

function ConfiguracoesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"conta" | "empresa">("conta");

  const { data: empresa, refetch: refetchEmpresa, isLoading: loadingEmpresa } = useQuery({
    queryKey: ["empresa-config", user?.id],
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

  const tabs = [
    { id: "conta" as const, label: "Minha Conta", icon: User },
    { id: "empresa" as const, label: "Empresa", icon: Building2 },
  ];

  if (!user) return null;

  return (
    <section className="bg-surface-sunken pb-20 pt-24 min-h-screen">
      <Container className="max-w-3xl">
        <Reveal>
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-black text-ink">Configurações</h1>
            <p className="mt-1 text-sm text-ink-muted">Gerencie sua conta e os dados da sua empresa.</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-hairline bg-white p-1 shadow-card w-fit">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Aba Conta ── */}
          {activeTab === "conta" && (
            <div className="space-y-5">
              <SectionCard icon={User} title="Dados da Conta" description="Nome e e-mail. Alteração de e-mail requer confirmação.">
                <BlocoDadosConta user={user} />
              </SectionCard>

              <SectionCard icon={Lock} title="Segurança" description="Altere sua senha de acesso.">
                <BlocoAlterarSenha />
              </SectionCard>

              <SectionCard icon={Bell} title="Notificações" description="Canais de comunicação disponíveis.">
                <BlocoNotificacoes />
              </SectionCard>
            </div>
          )}

          {/* ── Aba Empresa ── */}
          {activeTab === "empresa" && (
            <div>
              {loadingEmpresa ? (
                <ListSkeleton rows={3} />
              ) : !empresa ? (
                <div className="rounded-2xl border border-hairline bg-white p-8 text-center shadow-card">
                  <Building2 className="mx-auto size-12 text-ink-soft/40" />
                  <p className="mt-4 font-bold text-ink">Nenhuma empresa cadastrada</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Vá até a aba{" "}
                    <a href="/perfil" className="font-semibold text-brand-blue hover:underline">Meu Perfil</a>
                    {" "}para cadastrar os dados da sua empresa.
                  </p>
                </div>
              ) : empresa.status !== "aprovada" ? (
                <div className={`rounded-2xl border p-6 shadow-card ${
                  empresa.status === "pendente_aprovacao"
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"
                }`}>
                  {empresa.status === "pendente_aprovacao" ? (
                    <><Clock className="size-6 text-amber-600" />
                    <p className="mt-2 font-bold text-amber-900">Cadastro em análise</p>
                    <p className="mt-1 text-sm text-amber-700">A edição de dados estará disponível assim que sua empresa for aprovada.</p></>
                  ) : (
                    <><XCircle className="size-6 text-red-600" />
                    <p className="mt-2 font-bold text-red-900">Cadastro rejeitado</p>
                    <p className="mt-1 text-sm text-red-700">
                      Corrija os dados no <a href="/perfil" className="font-semibold underline">Meu Perfil</a> e reenvie para aprovação.
                    </p></>
                  )}
                </div>
              ) : (
                <SectionCard icon={Building2} title="Perfil da Empresa" description="Alterações nos dados cadastrais precisam ser aprovadas pela nossa equipe.">
                  <BlocoPerfilEmpresa empresa={empresa} refetchEmpresa={refetchEmpresa} />
                </SectionCard>
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
