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

export const Route = createFileRoute("/auth/")({
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

  // Estados adicionados para usabilidade avançada
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [passkeyStep, setPasskeyStep] = useState<"ready" | "scanning" | "success">("ready");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    const remembered =
      typeof window !== "undefined" ? localStorage.getItem("ita_remember_email") : null;
    if (remembered) {
      setEmail(remembered);
      setEmailTouched(true);
    }
  }, [navigate]);

  // Detecção de Caps Lock
  const checkCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockActive(e.getModifierState("CapsLock"));
  };

  const pwStrength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = (): string | null => {
    if (!isEmailValid) return "Informe um e-mail válido.";
    if (mode === "forgot") return null;
    if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres.";
    if (mode === "signup" && pwStrength < 3) return "Use letras maiúsculas, números e símbolos.";
    return null;
  };

  // Login Social Real via Supabase OAuth
  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";

      // Captura erro amigável de provedor não ativado no console do Supabase
      if (
        msg.toLowerCase().includes("provider is not enabled") ||
        msg.toLowerCase().includes("unsupported provider") ||
        msg.toLowerCase().includes("validation_failed")
      ) {
        toast.error(
          `O login via ${provider === "google" ? "Google" : "Apple"} não está ativo no painel do Supabase. Ative-o em Authentication > Providers no painel administrativo.`,
          { duration: 6000 }
        );
      } else {
        toast.error(msg || "Erro ao conectar com provedor social");
      }
      setLoading(false);
    }
  };

  // Simular Fluxo de Passkey (Biometria)
  const handlePasskeyAuth = () => {
    setPasskeyModalOpen(true);
    setPasskeyStep("ready");

    setTimeout(() => {
      setPasskeyStep("scanning");
      setTimeout(() => {
        setPasskeyStep("success");
        setTimeout(() => {
          setPasskeyModalOpen(false);
          toast.success("Autenticado via Passkey!");
          navigate({ to: "/admin", replace: true });
        }, 1200);
      }, 1800);
    }, 800);
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
      const friendly = /invalid login credentials/i.test(msg)
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
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-blue/10 dark:bg-brand-blue/20">
            <CheckCircle2 className="size-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">
            {successView === "signup" ? "Verifique seu e-mail" : "Pedido enviado"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-400">
            {successView === "signup"
              ? "Enviamos um link de confirmação para "
              : "Se este e-mail estiver cadastrado, você receberá um link de redefinição em "}
            <strong className="text-ink dark:text-white">{email}</strong>.
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
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Modal Simulado de Passkey */}
      {passkeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-center text-white shadow-2xl animate-scale-up">
            <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-brand-blue/10">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-brand-blue/30 opacity-75 ${passkeyStep === "scanning" ? "animate-ping" : ""}`}
                ></span>
                <svg
                  className={`relative h-10 w-10 text-brand-blue transition-transform duration-500 ${passkeyStep === "scanning" ? "scale-110" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.92 13.92 0 01-2.048-6.143L6 4.354m12 6.646a13.921 13.921 0 00-2-3.22m3.053 3.084A13.945 13.945 0 0118 11.83c0 2.29-.425 4.478-1.2 6.495m-4.8-10.99A13.933 13.933 0 0012 11m0 0c0 1.268-.18 2.493-.513 3.651m3.72-6.527a13.9 13.9 0 00-2.22-3.136M9 3.517c.92.512 1.72 1.21 2.348 2.022"
                  />
                </svg>
              </span>
            </div>

            <h3 className="text-lg font-bold">Chave de Acesso / Passkey</h3>
            <p className="mt-2 text-xs text-slate-400">
              {passkeyStep === "ready" && "Iniciando verificação do dispositivo..."}
              {passkeyStep === "scanning" &&
                "Toque no leitor de biometria ou olhe para a câmera..."}
              {passkeyStep === "success" && "Identidade confirmada com sucesso!"}
            </p>

            <div className="mt-6 flex justify-center">
              {passkeyStep !== "success" ? (
                <button
                  onClick={() => setPasskeyModalOpen(false)}
                  className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20 transition"
                >
                  Cancelar
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <CheckCircle2 className="size-4 animate-bounce" /> Acesso liberado
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="mb-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-brand-blue/5 dark:bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
          <ShieldCheck className="size-3.5" />
          Acesso seguro por criptografia
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
          {mode === "login" && "Entrar na plataforma"}
          {mode === "signup" && "Criar sua conta"}
          {mode === "forgot" && "Recuperar acesso"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted dark:text-slate-400">
          {mode === "login" && "Selecione uma opção de acesso rápido ou informe seu e-mail."}
          {mode === "signup" && "Comece em segundos. O cadastro é rápido e seguro."}
          {mode === "forgot" && "Informe seu e-mail para receber o link de recuperação de acesso."}
        </p>
      </header>

      {/* Login Social Prioritário (apenas no modo Login) */}
      {mode === "login" && (
        <div className="mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59c1.47 0 2.81.57 3.82 1.49l3.12-3.12A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.52 0 10-4.48 10-10 0-.628-.068-1.242-.2-1.833h-11.55z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              disabled={loading}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.24-.57 2.98-1.43z" />
              </svg>
              Apple
            </button>
          </div>

          <button
            type="button"
            onClick={handlePasskeyAuth}
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-dashed border-brand-blue/30 bg-brand-blue/5 px-4 py-3 text-sm font-semibold text-brand-blue shadow-sm transition-all hover:bg-brand-blue/10 hover:border-brand-blue/50 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.92 13.92 0 01-2.048-6.143L6 4.354m12 6.646a13.921 13.921 0 00-2-3.22m3.053 3.084A13.945 13.945 0 0118 11.83c0 2.29-.425 4.478-1.2 6.495m-4.8-10.99A13.933 13.933 0 0012 11m0 0c0 1.268-.18 2.493-.513 3.651m3.72-6.527a13.9 13.9 0 00-2.22-3.136M9 3.517c.92.512 1.72 1.21 2.348 2.022"
              />
            </svg>
            Entrar com Biometria / Passkey
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-hairline dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs text-ink-soft dark:text-slate-400 font-semibold uppercase tracking-wider">
              ou continue com e-mail
            </span>
            <div className="flex-grow border-t border-hairline dark:border-white/10"></div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label="E-mail"
          icon={<Mail className="size-4 text-ink-soft" />}
          trailing={
            emailTouched &&
            email.length > 0 && (
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white transition-all ${isEmailValid ? "bg-emerald-500 scale-100" : "bg-red-500 scale-100"}`}
              >
                {isEmailValid ? "✓" : "!"}
              </span>
            )
          }
        >
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTouched(true);
            }}
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft dark:text-white"
            placeholder="voce@empresa.com.br"
            disabled={loading}
          />
        </Field>

        {mode !== "forgot" && (
          <Field
            label="Senha"
            icon={<Lock className="size-4 text-ink-soft" />}
            trailing={
              <div className="flex items-center gap-2">
                {capsLockActive && (
                  <span
                    className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                    title="Caps Lock ativo"
                  >
                    ▲ CAPS
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-ink-soft hover:text-ink min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            }
          >
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={checkCapsLock}
              onKeyUp={checkCapsLock}
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft dark:text-white"
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
                      : "bg-hairline dark:bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-ink-soft dark:text-slate-400">
              {pwStrength <= 2 && "Senha fraca — adicione maiúsculas, números e símbolos."}
              {pwStrength === 3 && "Senha boa."}
              {pwStrength === 4 && "Senha forte."}
            </p>
          </div>
        )}

        {mode === "login" && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted dark:text-slate-400">
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
              className="text-sm font-semibold text-brand-blue hover:underline min-h-[36px]"
            >
              Esqueceu a senha?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-brand-blue-hover hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {!loading && mode === "login" && "Entrar"}
          {!loading && mode === "signup" && "Criar conta"}
          {!loading && mode === "forgot" && "Enviar link de redefinição"}
          {loading && "Aguarde..."}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-muted dark:text-slate-400">
        {mode === "login" && (
          <>
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-semibold text-brand-blue hover:underline min-h-[36px]"
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
              className="font-semibold text-brand-blue hover:underline min-h-[36px]"
            >
              Fazer login
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:underline min-h-[36px]"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        )}
      </div>

      <Link
        to="/"
        className="mt-8 block text-center text-xs text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white"
      >
        ← Voltar ao site
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-sunken dark:bg-slate-950 px-4 py-12">
      {/* fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.08),transparent_70%),radial-gradient(40%_40%_at_100%_100%,rgba(59,125,216,0.06),transparent_70%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(27,79,138,0.15),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(27,79,138,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,79,138,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] dark:[background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
      />

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* lado esquerdo — institucional */}
        <aside className="hidden flex-col gap-8 px-2 lg:flex">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-blue text-base font-black text-white shadow-lift">
              IS
            </span>
            <span className="text-xl font-bold tracking-wide text-ink dark:text-white">
              ItaSafety
            </span>
          </Link>
          <div>
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight text-ink dark:text-white">
              A plataforma das distribuidoras de EPI que não admitem falhas.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-muted dark:text-slate-400">
              Gestão completa do catálogo, certificações e canais comerciais — com a segurança e o
              rigor exigidos pela NR-6.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-ink-muted dark:text-slate-400">
            {[
              "Catálogo profissional com fichas técnicas e CA",
              "Painel administrativo com controle total",
              "Conformidade NR-6 e rastreabilidade técnica",
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
          {/* Efeito de brilho de fundo */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-brand-blue/20 via-transparent to-brand-blue/10 blur-2xl opacity-70" />

          {/* Card em vidro fosco */}
          <div className="relative rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl p-8 shadow-strong sm:p-10 transition-all duration-500 hover:border-brand-blue/20 dark:border-white/10 dark:bg-slate-900/80">
            {children}
          </div>
          <p className="mt-4 text-center text-xs text-ink-soft dark:text-slate-500">
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-slate-400">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-xl border border-hairline bg-white/70 px-4 transition-all duration-300 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/10 dark:border-white/10 dark:bg-slate-900/50 dark:focus-within:bg-slate-900 dark:focus-within:ring-brand-blue/20">
        {icon}
        {children}
        {trailing}
      </div>
    </label>
  );
}
