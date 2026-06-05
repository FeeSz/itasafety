import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { checkAuthRateLimit, recordAuthAttempt } from "@/lib/auth.functions";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  head: () =>
    pageMeta({
      title: "Acesso — ItaSafety",
      description: "Acesso seguro à plataforma ItaSafety.",
      path: "/auth",
      noindex: true,
    }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const checkLimit = useServerFn(checkAuthRateLimit);
  const recordAttempt = useServerFn(recordAuthAttempt);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState<null | "signup" | "forgot">(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    const remembered = typeof window !== "undefined" ? localStorage.getItem("ita_remember_email") : null;
    if (remembered) setEmail(remembered);
  }, [navigate]);

  const pwStrength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();

  const validate = (): string | null => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Informe um e-mail válido.";
    if (mode === "forgot") return null;
    if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres.";
    if (mode === "signup" && pwStrength < 3)
      return "Use letras maiúsculas, números e símbolos.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      const attempt_type = mode === "login" ? "login" : mode === "signup" ? "signup" : "reset";
      const limit = await checkLimit({ data: { email, attempt_type } });
      if (limit.blocked) {
        toast.error(limit.reason || "Limite excedido. Aguarde alguns minutos.");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        await recordAttempt({ data: { email, attempt_type, success: !error } });
        if (error) throw error;
        setSuccessView("signup");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        await recordAttempt({ data: { email, attempt_type, success: !error } });
        // Não revelar se o e-mail existe (anti-enumeração)
        setSuccessView("forgot");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        await recordAttempt({ data: { email, attempt_type, success: !error } });
        if (error) throw error;
        if (remember) localStorage.setItem("ita_remember_email", email);
        else localStorage.removeItem("ita_remember_email");
        toast.success("Bem-vindo!");
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar";
      // mensagens genéricas anti-enumeração
      const friendly =
        /invalid login credentials/i.test(msg)
          ? "E-mail ou senha incorretos."
          : /email not confirmed/i.test(msg)
            ? "Confirme seu e-mail antes de entrar."
            : /already registered/i.test(msg)
              ? "Este e-mail já está cadastrado."
              : msg;
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  if (successView) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-blue-tint">
            <CheckCircle2 className="size-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            {successView === "signup" ? "Verifique seu e-mail" : "Pedido enviado"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {successView === "signup"
              ? "Enviamos um link de confirmação para "
              : "Se este e-mail estiver cadastrado, você receberá um link de redefinição em "}
            <strong className="text-ink">{email}</strong>.
            <br />
            {successView === "signup"
              ? "Clique no link para ativar sua conta e poder acessar."
              : "Verifique sua caixa de entrada e spam."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSuccessView(null);
              setMode("login");
            }}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-7">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-brand-blue-tint/40 px-3 py-1 text-xs font-semibold text-brand-blue">
          <ShieldCheck className="size-3.5" />
          Acesso seguro
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          {mode === "login" && "Entrar na plataforma"}
          {mode === "signup" && "Criar sua conta"}
          {mode === "forgot" && "Recuperar acesso"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {mode === "login" && "Acesse o painel ItaSafety com suas credenciais."}
          {mode === "signup" && "Comece em segundos. Você receberá um e-mail de confirmação."}
          {mode === "forgot" && "Informe seu e-mail e enviaremos um link de redefinição."}
        </p>
      </header>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="E-mail" icon={<Mail className="size-4 text-ink-soft" />}>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-soft"
            placeholder="voce@empresa.com.br"
            disabled={loading}
          />
        </Field>

        {mode !== "forgot" && (
          <Field label="Senha" icon={<Lock className="size-4 text-ink-soft" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-ink-soft hover:text-ink"
                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          >
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-soft"
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
            />
          </Field>
        )}

        {mode === "signup" && password.length > 0 && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < pwStrength
                      ? pwStrength <= 2
                        ? "bg-amber-500"
                        : pwStrength === 3
                          ? "bg-brand-blue"
                          : "bg-emerald-600"
                      : "bg-hairline"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-ink-soft">
              {pwStrength <= 2 && "Senha fraca — adicione maiúsculas, números e símbolos."}
              {pwStrength === 3 && "Senha boa."}
              {pwStrength === 4 && "Senha forte."}
            </p>
          </div>
        )}

        {mode === "login" && (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-hairline accent-brand-blue"
              />
              Lembrar acesso
            </label>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-sm font-semibold text-brand-blue hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-brand-blue py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-brand-blue-hover hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {!loading && mode === "login" && "Entrar"}
          {!loading && mode === "signup" && "Criar conta"}
          {!loading && mode === "forgot" && "Enviar link de redefinição"}
          {loading && "Aguarde..."}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-muted">
        {mode === "login" && (
          <>
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-semibold text-brand-blue hover:underline"
            >
              Cadastre-se
            </button>
          </>
        )}
        {mode === "signup" && (
          <>
            Já é cadastrado?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-semibold text-brand-blue hover:underline"
            >
              Fazer login
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        )}
      </div>

      <Link
        to="/"
        className="mt-8 block text-center text-xs text-ink-soft hover:text-ink"
      >
        ← Voltar ao site
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-sunken px-4 py-12">
      {/* fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.08),transparent_70%),radial-gradient(40%_40%_at_100%_100%,rgba(59,125,216,0.06),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(27,79,138,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,79,138,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* lado esquerdo — institucional */}
        <aside className="hidden flex-col gap-8 px-2 lg:flex">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-brand-blue text-base font-black text-white shadow-lift">
              IS
            </span>
            <span className="text-lg font-bold text-ink">ItaSafety</span>
          </Link>
          <div>
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight text-ink">
              A plataforma das distribuidoras de EPI que não admitem falhas.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-muted">
              Gestão completa do catálogo, certificações e canais comerciais — com a
              segurança e o rigor exigidos pela NR-6.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-ink-muted">
            {[
              "Catálogo profissional com fichas técnicas e CA",
              "Painel administrativo com controle total",
              "Conformidade NR-6 e rastreabilidade",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-blue" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* card direito — form */}
        <div className="relative w-full">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-brand-blue/15 via-brand-blue/0 to-brand-blue/0 blur-xl" />
          <div className="relative rounded-2xl border border-hairline bg-white p-8 shadow-strong sm:p-10">
            {children}
          </div>
          <p className="mt-4 text-center text-xs text-ink-soft">
            Protegido por boas práticas de segurança — TLS, hash bcrypt, rate limit.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  trailing,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 transition-colors focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15">
        {icon}
        {children}
        {trailing}
      </div>
    </label>
  );
}
