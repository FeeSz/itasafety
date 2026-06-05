import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () =>
    pageMeta({
      title: "Redefinir senha — ItaSafety",
      description: "Defina uma nova senha de acesso.",
      path: "/reset-password",
      noindex: true,
    }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase trata o magic link e cria uma sessão de recovery
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValid(true);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Mínimo 8 caracteres.");
    if (strength < 3) return toast.error("Senha fraca. Use maiúsculas, números e símbolos.");
    if (password !== confirm) return toast.error("As senhas não coincidem.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Senha redefinida.");
      setTimeout(() => navigate({ to: "/auth", replace: true }), 1800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-surface-sunken px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.08),transparent_70%)]"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-white p-8 shadow-strong sm:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-brand-blue-tint/40 px-3 py-1 text-xs font-semibold text-brand-blue">
          <ShieldCheck className="size-3.5" />
          Redefinição segura
        </div>
        <h1 className="text-2xl font-bold text-ink">Nova senha</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Defina uma senha forte para sua conta ItaSafety.
        </p>

        {!ready && (
          <div className="mt-8 flex justify-center">
            <Loader2 className="size-5 animate-spin text-brand-blue" />
          </div>
        )}

        {ready && !valid && (
          <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Link inválido ou expirado. Solicite uma nova redefinição.
            <div className="mt-3">
              <Link
                to="/auth"
                className="font-semibold text-brand-blue hover:underline"
              >
                Voltar
              </Link>
            </div>
          </div>
        )}

        {ready && valid && !done && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Nova senha
              </span>
              <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15">
                <Lock className="size-4 text-ink-soft" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-ink-soft hover:text-ink"
                  aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {password.length > 0 && (
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < strength
                        ? strength <= 2
                          ? "bg-amber-500"
                          : strength === 3
                            ? "bg-brand-blue"
                            : "bg-emerald-600"
                        : "bg-hairline"
                    }`}
                  />
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Confirmar senha
              </span>
              <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15">
                <Lock className="size-4 text-ink-soft" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  placeholder="Repita a nova senha"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-brand-blue-hover disabled:opacity-70"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        {done && (
          <div className="mt-6 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              Senha redefinida com sucesso. Redirecionando para o login...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
