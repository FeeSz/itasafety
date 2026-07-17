import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { checkAuthRateLimit, recordAuthAttempt } from "@/lib/auth.functions";
import brandLogo from "@/assets/itasafety-header-logo.png";

type AuthAttemptType = "login" | "signup" | "reset";

export const Route = createFileRoute("/auth/")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
    mode: typeof s.mode === "string" ? s.mode : undefined,
  }),
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
  const { next, mode: initialMode } = Route.useSearch();
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const callbackUrl = safeNext
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(safeNext)}`
    : `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;
  const checkLimit = useServerFn(checkAuthRateLimit);
  const recordAttempt = useServerFn(recordAuthAttempt);

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState<null | "signup" | "forgot">(null);

  const [email, setEmail] = useState("");

  // Auto-login check
  useEffect(() => {
    let mounted = true;
    async function redirectExistingSession() {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id;
        if (!userId || !mounted) return;

        const userIsAdmin = await getUserIsAdmin(userId);
        if (!mounted) return;

        sessionStorage.setItem("ita_is_admin", userIsAdmin ? "true" : "false");
        if (safeNext) {
          window.location.assign(safeNext);
          return;
        }
        navigate({ to: userIsAdmin ? "/admin" : "/", replace: true });
      } catch (error) {
        console.error("[Auth] Error checking existing session:", error);
      }
    }
    redirectExistingSession();

    const remembered = typeof window !== "undefined" ? localStorage.getItem("ita_remember_email") : null;
    if (remembered) {
      setEmail(remembered);
    }
    return () => { mounted = false; };
  }, [navigate, safeNext]);

  // Social Auth
  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg || `Erro ao entrar com ${provider === "google" ? "Google" : "Apple"}`);
      setLoading(false);
    }
  };

  if (successView) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center p-8 backdrop-blur-md bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-blue/20">
            <CheckCircle2 className="size-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {successView === "signup" ? "Verifique seu e-mail" : "Pedido enviado"}
          </h1>
          <p className="text-sm leading-relaxed text-slate-300">
            {successView === "signup"
              ? "Enviamos um link de confirmação para "
              : "Se este e-mail estiver cadastrado, você receberá um link em "}
            <strong className="text-white">{email}</strong>.
            <br /><br />
            {successView === "signup"
              ? "Clique no link para ativar sua conta e poder acessar."
              : "Verifique sua caixa de entrada e spam."}
          </p>
          <button
            type="button"
            onClick={() => { setSuccessView(null); setIsSignUp(false); setIsForgot(false); }}
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-bold text-brand-blue-light hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[100dvh] bg-slate-950 overflow-hidden flex flex-col md:block">
      {/* Background Decor */}
      <div className="pointer-events-none absolute left-0 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-brand-blue/10 blur-[120px]" />

      {/* Header Minimalista (Voltar) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-[100] flex items-center">
        <Link to="/" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition">
          <ArrowLeft className="mr-2 size-4" /> Voltar ao site
        </Link>
      </div>

      {/* Logo Centralizada */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:top-8 z-[100] flex items-center justify-center pointer-events-none">
        <img src={brandLogo} alt="ItaSafety" className="h-[150px] w-auto brightness-0 invert drop-shadow-md" />
      </div>

      {/* Main Container */}
      <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col md:block">

        {/* ============================================================ */}
        {/* SIGN IN / FORGOT FORM (Left side desktop, crossfade mobile) */}
        {/* ============================================================ */}
        <div className={`absolute inset-0 md:w-1/2 h-[100dvh] z-20 flex flex-col justify-center p-6 pt-20 sm:p-8 md:p-12 lg:px-20 transition-all duration-700 ease-in-out overflow-y-auto md:overflow-hidden
          ${isSignUp ? 'opacity-0 pointer-events-none md:translate-x-full' : 'opacity-100 md:translate-x-0'}`}>

          <div className={`transition-all duration-500 ease-in-out absolute inset-0 p-6 pt-20 sm:p-8 md:p-12 lg:px-20 flex flex-col justify-center overflow-y-auto md:overflow-hidden ${isForgot ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
            <SignInForm
              email={email}
              setEmail={setEmail}
              onForgot={() => setIsForgot(true)}
              checkLimit={checkLimit}
              recordAttempt={recordAttempt}
              callbackUrl={callbackUrl}
              safeNext={safeNext}
              setLoading={setLoading}
              loading={loading}
              handleSocial={handleSocialLogin}
            />
            {/* Mobile Only Switcher */}
            <div className="md:hidden mt-8 text-center text-sm text-white/60">
              Não tem uma conta? <button onClick={() => setIsSignUp(true)} className="text-white hover:underline font-bold">Cadastre-se</button>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-in-out absolute inset-0 p-6 pt-20 sm:p-8 md:p-12 lg:px-20 flex flex-col justify-center overflow-y-auto md:overflow-hidden ${!isForgot ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'}`}>
            <ForgotForm
              email={email}
              setEmail={setEmail}
              onBack={() => setIsForgot(false)}
              checkLimit={checkLimit}
              recordAttempt={recordAttempt}
              setSuccessView={setSuccessView}
              setLoading={setLoading}
              loading={loading}
            />
          </div>

        </div>

        {/* ============================================================ */}
        {/* SIGN UP FORM (Right side desktop, crossfade mobile) */}
        {/* ============================================================ */}
        <div className={`absolute inset-0 md:w-1/2 h-[100dvh] flex flex-col justify-center p-6 pt-20 sm:p-8 md:p-12 lg:px-20 transition-all duration-700 ease-in-out overflow-y-auto md:overflow-hidden
          ${isSignUp ? 'opacity-100 z-20 md:translate-x-full' : 'opacity-0 pointer-events-none z-10 md:translate-x-0'}`}>
          <SignUpForm
            email={email}
            setEmail={setEmail}
            checkLimit={checkLimit}
            recordAttempt={recordAttempt}
            callbackUrl={callbackUrl}
            setSuccessView={setSuccessView}
            setLoading={setLoading}
            loading={loading}
            handleSocial={handleSocialLogin}
          />
          {/* Mobile Only Switcher */}
          <div className="md:hidden mt-8 text-center text-sm text-white/60">
            Já tem uma conta? <button onClick={() => setIsSignUp(false)} className="text-white hover:underline font-bold">Entrar</button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDING OVERLAY (Desktop Only) */}
        {/* ============================================================ */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-[100dvh] bg-brand-blue overflow-hidden transition-transform duration-700 ease-in-out z-30 shadow-2xl ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className="relative w-full h-full bg-gradient-to-br from-brand-blue to-[#0f1f38]">
            {/* Decorative background circle */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Panel Left (Sign In CTA) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ease-in-out ${isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>
              <h2 className="text-4xl font-display font-black text-white mb-6 leading-tight">Já tem uma<br />conta?</h2>
              <p className="text-white/80 mb-10 max-w-sm leading-relaxed">
                Acesse sua área restrita para conferir seus pedidos e as cotações de EPIs.
              </p>
              <button
                onClick={() => { setIsSignUp(false); setIsForgot(false); }}
                className="rounded-full border-2 border-white/30 px-10 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-brand-blue active:scale-95"
              >
                Entrar
              </button>
            </div>

            {/* Panel Right (Sign Up CTA) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
              <h2 className="text-4xl font-display font-black text-white mb-6 leading-tight">Novo por<br />aqui?</h2>
              <p className="text-white/80 mb-10 max-w-sm leading-relaxed">
                Cadastre-se para solicitar cotações e ter acesso ao nosso catálogo de proteção completo.
              </p>
              <button
                onClick={() => { setIsSignUp(true); setIsForgot(false); }}
                className="rounded-full border-2 border-white/30 px-10 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-brand-blue active:scale-95"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Trust Badges */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none hidden md:block z-[100] px-4">
        <p className="flex items-center justify-center gap-2 text-[11px] lg:text-xs font-medium text-white/40 bg-slate-950/50 rounded-full py-1.5 w-max mx-auto px-4 backdrop-blur-sm">
          <ShieldCheck className="size-4" />
          Protegido por TLS · bcrypt · rate-limit · LGPD
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// FORMS
// ============================================================================

function SignInForm({ email, setEmail, onForgot, checkLimit, recordAttempt, callbackUrl, safeNext, setLoading, loading, handleSocial }: any) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e["email"] = "E-mail inválido";
    if (password.length < 8) e["password"] = "Mínimo 8 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const limit = await checkLimit({ data: { email, attempt_type: "login" } });
      if (limit.blocked) throw new Error(limit.reason || "Limite excedido. Aguarde alguns minutos.");

      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await recordAuthenticatedAttempt(recordAttempt, "login", email);
      const userIsAdmin = authData?.user ? await getUserIsAdmin(authData.user.id) : false;
      sessionStorage.setItem("ita_is_admin", userIsAdmin ? "true" : "false");
      if (remember) localStorage.setItem("ita_remember_email", email);
      else localStorage.removeItem("ita_remember_email");

      toast.success("Bem-vindo de volta!");
      if (userIsAdmin) {
        if (safeNext) window.location.assign(safeNext);
        else window.location.assign("/admin");
      } else {
        if (safeNext) window.location.assign(safeNext);
        else window.location.assign("/");
      }
    } catch (err: any) {
      console.error("[Auth] Sign in failed:", err);
      const msg = err.message || "Erro";
      const friendly = /invalid login credentials/i.test(msg) ? "E-mail ou senha inválidos."
        : /email not confirmed/i.test(msg) ? "Confirme seu e-mail antes de entrar."
          : "E-mail ou senha inválidos.";
      toast.error(friendly);
      if (/invalid login credentials/i.test(msg)) {
        await recordAttempt({ data: { attempt_type: "login", success: false, email } }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm mx-auto" noValidate>
      <h2 className="text-3xl font-bold text-white mb-1">Entrar</h2>
      <p className="text-white/50 text-sm mb-5">Utilize suas credenciais para acessar.</p>

      <div className="space-y-4">
        <FloatingInput id="login-email" label="E-mail" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} disabled={loading} />
        <FloatingInput
          id="login-password"
          label="Senha"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading}
          rightElement={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white transition">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between mt-4 mb-4">
        <label className="flex items-center space-x-2 text-sm text-white/70 cursor-pointer hover:text-white transition group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${remember ? 'bg-brand-blue border-brand-blue' : 'border-white/30 group-hover:border-white/50'}`}>
            {remember && <Check className="size-3 text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Lembrar acesso</span>
        </label>
        <button type="button" onClick={onForgot} className="text-sm text-brand-blue font-medium hover:underline">
          Esqueceu a senha?
        </button>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-full bg-white py-3.5 text-sm font-bold uppercase tracking-widest text-brand-blue shadow-md transition-all hover:bg-gray-100 disabled:opacity-60 flex justify-center items-center h-[52px]">
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Entrar"}
      </button>


      <SocialLogin loading={loading} handleSocial={handleSocial} />
    </form>
  );
}

function SignUpForm({ email, setEmail, checkLimit, recordAttempt, callbackUrl, setSuccessView, setLoading, loading, handleSocial }: any) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e["name"] = "Obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e["email"] = "E-mail inválido";
    if (password.length < 8) e["password"] = "Mínimo 8 caracteres";
    if (password !== confirm) e["confirm"] = "Senhas não conferem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const limit = await checkLimit({ data: { email, attempt_type: "signup" } });
      if (limit.blocked) throw new Error(limit.reason || "Limite excedido. Aguarde alguns minutos.");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl, data: { full_name: name } },
      });
      if (error) throw error;

      await recordAuthenticatedAttempt(recordAttempt, "signup", email);
      setSuccessView("signup");
    } catch (err: any) {
      const msg = err.message || "Erro";
      const friendly = /already registered/i.test(msg) ? "Este e-mail já está cadastrado." : msg;
      toast.error(friendly);
      if (err.status >= 400 && err.status < 500) {
        await recordAttempt({ data: { attempt_type: "signup", success: false, email } }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm mx-auto" noValidate>
      <h2 className="text-3xl font-bold text-white mb-1">Criar Conta</h2>
      <p className="text-white/50 text-sm mb-3">Preencha seus dados abaixo.</p>

      <div className="space-y-3">
        <FloatingInput id="reg-name" label="Nome completo" type="text" value={name} onChange={(e: any) => setName(e.target.value)} error={errors.name} disabled={loading} />
        <FloatingInput id="reg-email" label="E-mail" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} disabled={loading} />

        <FloatingInput
          id="reg-password"
          label="Senha"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading}
          rightElement={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white transition">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <FloatingInput
          id="reg-confirm"
          label="Confirmar"
          type={showPw ? "text" : "password"}
          value={confirm}
          onChange={(e: any) => setConfirm(e.target.value)}
          error={errors.confirm}
          disabled={loading}
          rightElement={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white transition">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-full bg-brand-blue py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-brand-blue-hover disabled:opacity-60 flex justify-center items-center h-[52px] mt-5">
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Cadastrar"}
      </button>


      <SocialLogin loading={loading} handleSocial={handleSocial} />
    </form>
  );
}

function ForgotForm({ email, setEmail, onBack, checkLimit, recordAttempt, setSuccessView, setLoading, loading }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "E-mail inválido" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const limit = await checkLimit({ data: { email, attempt_type: "reset" } });
      if (limit.blocked) throw new Error(limit.reason || "Limite excedido. Aguarde alguns minutos.");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessView("forgot");
    } catch (err: any) {
      toast.error(err.message || "Erro");
      if (err.status >= 400 && err.status < 500) {
        await recordAttempt({ data: { attempt_type: "reset", success: false, email } }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm mx-auto" noValidate>
      <h2 className="text-3xl font-bold text-white mb-1">Recuperar Senha</h2>
      <p className="text-white/50 text-sm mb-6">Enviaremos um link de redefinição para o seu e-mail.</p>

      <div className="space-y-4 mb-6">
        <FloatingInput id="forgot-email" label="E-mail de cadastro" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} disabled={loading} />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-full bg-brand-blue py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-brand-blue-hover disabled:opacity-60 flex justify-center items-center h-[52px] mb-6">
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Enviar Link"}
      </button>

      <div className="text-center">
        <button type="button" onClick={onBack} className="text-white hover:underline font-bold inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="size-4" /> Voltar ao Login
        </button>
      </div>
    </form>
  );
}

function SocialLogin({ loading, handleSocial }: any) {
  return (
    <>
      <div className="relative flex items-center py-6 mt-4">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="mx-4 text-[10px] font-bold text-white/30 uppercase tracking-wider">ou entre com</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>
      <div className="flex justify-center gap-4">
        <button type="button" onClick={() => handleSocial("google")} disabled={loading} className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-medium text-white/80">
          <svg className="size-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59c1.47 0 2.81.57 3.82 1.49l3.12-3.12A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.52 0 10-4.48 10-10 0-.628-.068-1.242-.2-1.833h-11.55z" />
          </svg> Google
        </button>
        <button type="button" onClick={() => handleSocial("apple")} disabled={loading} className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-medium text-white/80">
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.24-.57 2.98-1.43z" />
          </svg> Apple
        </button>
      </div>
    </>
  );
}

// ============================================================================
// MICRO-COMPONENTS
// ============================================================================

function FloatingInput({ id, label, type, error, rightElement, ...props }: any) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        className={`peer w-full h-[52px] bg-black/20 text-white rounded-lg border ${error ? 'border-brand-red' : 'border-white/10'} pl-4 pt-4 pb-1 text-sm outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:bg-black/40 ${rightElement ? 'pr-10' : 'pr-4'}`}
        placeholder=" "
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {rightElement}
        </div>
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-white/40 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[13px] peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-brand-blue peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:text-white/60"
      >
        {label}
      </label>
      {error && <p className="absolute -bottom-5 left-1 text-[10px] text-brand-red font-medium">{error}</p>}
    </div>
  );
}

// ============================================================================
// UTILS
// ============================================================================

async function recordAuthenticatedAttempt(
  recordAttempt: (input: { data: { attempt_type: AuthAttemptType; success?: boolean; email?: string } }) => Promise<{ ok: boolean }>,
  attempt_type: AuthAttemptType,
  email: string
) {
  try {
    await recordAttempt({ data: { attempt_type, success: true, email } });
  } catch (error) {
    console.warn("[Auth] Skipping authenticated attempt audit:", error);
  }
}

async function getUserIsAdmin(userId: string) {
  const { data: roles, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) {
    console.error("[Auth] Error checking user role:", error);
    return false;
  }
  return (roles ?? []).some((r) => r.role === "admin");
}
