import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  KeyRound,
  X,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () =>
    pageMeta({
      title: "Redefinir senha — ItaSafety",
      description: "Defina uma nova senha de acesso segura.",
      path: "/reset-password",
      noindex: true,
    }),
  component: ResetPasswordPage,
});

/** Requisitos individuais de senha */
const RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "Um número", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "Um símbolo (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  // ── Valida sessão de recovery recebida do link ─────────────────────────
  useEffect(() => {
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

  // ── Countdown automático ao concluir ──────────────────────────────────
  useEffect(() => {
    if (!done) return;
    countdownRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(countdownRef.current!);
          navigate({ to: "/auth", replace: true });
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [done, navigate]);

  // ── Análise em tempo real ──────────────────────────────────────────────
  const passedRules = RULES.filter((r) => r.test(password));
  const strength = passedRules.length; // 0-4
  const allRulesPassed = strength === RULES.length;
  const confirmMatch = confirm.length > 0 && password === confirm;
  const confirmMismatch = confirm.length > 0 && password !== confirm;

  const strengthLabel =
    strength === 0 ? "" : strength <= 2 ? "Fraca" : strength === 3 ? "Boa" : "Forte";
  const strengthColor =
    strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-brand-blue" : "bg-emerald-500";

  // ── Submit ─────────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPassed) {
      toast.error("A senha não atende todos os requisitos de segurança.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      confirmInputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao redefinir senha";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de SUCESSO ────────────────────────────────────────────────────
  if (done) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          {/* Ícone animado de sucesso */}
          <div className="relative mb-6">
            <div className="flex size-24 items-center justify-center rounded-full bg-emerald-50">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-9 text-emerald-600 animate-scale-up" />
              </div>
            </div>
            {/* Pulso de confirmação */}
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-30" />
          </div>

          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Senha redefinida!</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted max-w-xs">
            Sua nova senha foi salva com sucesso. Você já pode fazer login com ela agora.
          </p>

          {/* Barra de countdown visual */}
          <div className="mt-8 w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-xs text-ink-muted">
              <span>Redirecionando automaticamente em</span>
              <span className="font-bold tabular-nums text-brand-blue">{countdown}s</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Botão de ação imediata */}
          <button
            type="button"
            onClick={() => {
              if (countdownRef.current) clearInterval(countdownRef.current);
              navigate({ to: "/auth", replace: true });
            }}
            className="mt-6 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-brand-blue-hover hover:shadow-strong active:scale-95"
          >
            Ir para o login agora
            <ArrowRight className="size-4" />
          </button>

          <p className="mt-4 text-xs text-ink-soft">
            Problema com o acesso?{" "}
            <Link to="/auth" className="font-semibold text-brand-blue hover:underline">
              contate o suporte
            </Link>
          </p>
        </div>
      </Shell>
    );
  }

  // ── Carregando ─────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="size-8 animate-spin text-brand-blue" />
          <p className="text-sm text-ink-muted">Verificando link de redefinição...</p>
        </div>
      </Shell>
    );
  }

  // ── Link inválido/expirado ─────────────────────────────────────────────
  if (!valid) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="size-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-ink">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Este link de redefinição não é mais válido. Solicite um novo link na tela de login.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-lift hover:bg-brand-blue-hover"
          >
            Solicitar novo link
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Formulário principal ───────────────────────────────────────────────
  return (
    <Shell>
      {/* Badge de segurança */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-brand-blue/5 px-3 py-1 text-xs font-semibold text-brand-blue">
        <ShieldCheck className="size-3.5" />
        Redefinição segura por e-mail verificado
      </div>

      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10">
          <KeyRound className="size-5 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Nova senha</h1>
          <p className="text-sm text-ink-muted">Escolha uma senha forte e segura</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        {/* Campo: Nova senha */}
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Nova senha
          </label>
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 transition-all duration-200 focus-within:ring-4 ${
              password.length > 0
                ? allRulesPassed
                  ? "border-emerald-400 focus-within:border-emerald-400 focus-within:ring-emerald-100"
                  : "border-amber-400 focus-within:border-amber-400 focus-within:ring-amber-100"
                : "border-hairline focus-within:border-brand-blue focus-within:ring-brand-blue/10"
            } bg-white`}
          >
            <Lock className="size-4 shrink-0 text-ink-soft" />
            <input
              id="new-password"
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft"
              placeholder="Crie sua nova senha"
              aria-describedby="password-rules"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="flex size-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-sunken hover:text-ink"
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Barra de força */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < strength ? strengthColor : "bg-hairline"
                      }`}
                    />
                  ))}
                </div>
                {strengthLabel && (
                  <span
                    className={`text-[11px] font-bold ${
                      strength <= 2
                        ? "text-red-500"
                        : strength === 3
                          ? "text-brand-blue"
                          : "text-emerald-600"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Checklist de requisitos */}
          <div
            id="password-rules"
            className="mt-3 grid grid-cols-2 gap-1.5"
            aria-label="Requisitos da senha"
          >
            {RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <div
                  key={rule.id}
                  className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                    passed ? "text-emerald-600" : "text-ink-soft"
                  }`}
                >
                  {passed ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <X className="size-3 text-ink-soft/50" />
                  )}
                  {rule.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Campo: Confirmar senha */}
        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Confirmar senha
          </label>
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 transition-all duration-200 focus-within:ring-4 ${
              confirmMismatch
                ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
                : confirmMatch
                  ? "border-emerald-400 focus-within:border-emerald-400 focus-within:ring-emerald-100"
                  : "border-hairline focus-within:border-brand-blue focus-within:ring-brand-blue/10"
            } bg-white`}
          >
            <Lock className="size-4 shrink-0 text-ink-soft" />
            <input
              id="confirm-password"
              ref={confirmInputRef}
              type={showConfirm ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft"
              placeholder="Repita a nova senha"
              aria-describedby="confirm-hint"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="flex size-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-sunken hover:text-ink"
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            {/* Ícone inline de validação */}
            {confirmMatch && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
            {confirmMismatch && <X className="size-4 shrink-0 text-red-500" />}
          </div>
          {/* Hint de erro em tempo real */}
          {confirmMismatch && (
            <p id="confirm-hint" className="mt-1.5 text-xs font-medium text-red-500" role="alert">
              As senhas não coincidem
            </p>
          )}
          {confirmMatch && (
            <p id="confirm-hint" className="mt-1.5 text-xs font-medium text-emerald-600">
              Senhas conferem ✓
            </p>
          )}
        </div>

        {/* Botão principal */}
        <button
          type="submit"
          disabled={loading || !allRulesPassed || !confirmMatch}
          className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-brand-blue-hover hover:shadow-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Salvar nova senha
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-brand-blue transition-colors"
        >
          ← Voltar para o login
        </Link>
      </div>
    </Shell>
  );
}

/* ── Shell compartilhado ─────────────────────────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-sunken px-4 py-12 dark:bg-slate-950">
      {/* Fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.08),transparent_70%),radial-gradient(40%_40%_at_100%_100%,rgba(59,125,216,0.06),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(27,79,138,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,79,138,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Brilho de fundo */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-brand-blue/20 via-transparent to-brand-blue/10 blur-2xl opacity-60" />
        <div className="relative rounded-2xl border border-white/60 bg-white/90 p-8 shadow-strong backdrop-blur-xl transition-all sm:p-10 dark:border-white/10 dark:bg-slate-900/90">
          {children}
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft dark:text-slate-500">
          Protegido por TLS · bcrypt · Supabase Auth
        </p>
      </div>
    </div>
  );
}
