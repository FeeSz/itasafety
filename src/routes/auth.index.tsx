import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, MouseEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { checkAuthRateLimit, recordAuthAttempt } from "@/lib/auth.functions";

import brandLogo from "@/assets/itasafety-header-logo.png";
import imgCapacete from "@/assets/product-capacete.jpg";
import imgLuvas from "@/assets/product-luvas.jpg";
import imgOculos from "@/assets/product-oculos.jpg";
import imgRespirador from "@/assets/product-respirador.jpg";

type Mode = "login" | "signup" | "forgot";
type AuthAttemptType = "login" | "signup" | "reset";

export const Route = createFileRoute("/auth/")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
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
  const checkLimit = useServerFn(checkAuthRateLimit);
  const recordAttempt = useServerFn(recordAuthAttempt);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successView, setSuccessView] = useState<null | "signup" | "forgot">(null);

  const [capsLockActive, setCapsLockActive] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

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
        navigate({ to: userIsAdmin ? "/admin" : "/", replace: true });
      } catch (error) {
        console.error("[Auth] Error checking existing session:", error);
      }
    }

    redirectExistingSession();

    const remembered = typeof window !== "undefined" ? localStorage.getItem("ita_remember_email") : null;
    if (remembered) {
      setEmail(remembered);
      setEmailTouched(true);
    }

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const checkCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockActive(e.getModifierState("CapsLock"));
  };

  const pwStrength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = (): string | null => {
    if (!isEmailValid) return "Informe um e-mail válido.";
    if (mode === "forgot") return null;
    if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres.";
    if (mode === "signup" && pwStrength < 3) return "Use letras maiúsculas, números e símbolos.";
    return null;
  };

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
      toast.error(msg || `Erro ao entrar com ${provider === "google" ? "Google" : "Apple"}`);
      setLoading(false);
    }
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
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        await recordAuthenticatedAttempt(recordAttempt, attempt_type);
        setSuccessView("signup");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessView("forgot");
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await recordAuthenticatedAttempt(recordAttempt, attempt_type);

        const userIsAdmin = authData?.user ? await getUserIsAdmin(authData.user.id) : false;
        sessionStorage.setItem("ita_is_admin", userIsAdmin ? "true" : "false");

        if (remember) localStorage.setItem("ita_remember_email", email);
        else localStorage.removeItem("ita_remember_email");
        toast.success("Bem-vindo!");

        if (userIsAdmin) {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/", replace: true });
        }
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-white">
        <div className="text-center p-8 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl max-w-md w-full">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-blue/20">
            <CheckCircle2 className="size-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {successView === "signup" ? "Verifique seu e-mail" : "Pedido enviado"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {successView === "signup"
              ? "Enviamos um link de confirmação para "
              : "Se este e-mail estiver cadastrado, você receberá um link em "}
            <strong className="text-white">{email}</strong>.
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
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-bold text-brand-blue-light hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative flex min-h-[100dvh] bg-slate-950 text-white overflow-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Background sutil da identidade (Deep Blue) */}
      <div className="pointer-events-none absolute left-0 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-brand-blue/10 blur-[120px]" />
      
      <div className="relative z-10 w-full grid lg:grid-cols-2">
        
        {/* Left Side: Visual Composition & Impact Text */}
        <div className="hidden lg:flex flex-col justify-center p-12 lg:p-20 relative">
          
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur">
              <ShieldCheck className="size-3.5" />
              Distribuidora certificada · NR-6
            </span>
          </div>

          <h1 className="font-display text-5xl xl:text-6xl font-black mb-6 tracking-tight text-white leading-tight">
            {mode === 'login' && 'Bem-vindo\nde volta.'}
            {mode === 'signup' && 'Vista o\nequipamento certo.'}
            {mode === 'forgot' && 'Recuperar\nacesso.'}
          </h1>
          
          <p className="text-lg text-white/70 max-w-md mb-12">
            Proteção que não admite falhas. Acesse sua área para acompanhar o catálogo de EPIs homologados.
          </p>

          <Link
            to="/"
            className="group inline-flex items-center gap-3 text-white/70 hover:text-white transition w-fit font-semibold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao site
          </Link>

          {/* Parallax Visual Composition */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[500px] pointer-events-none perspective-1000">
            {mode === 'login' ? (
              <>
                {/* Capacete */}
                <div 
                  className="absolute top-[10%] right-[10%] w-64 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
                  style={{ transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)` }}
                >
                  <div className="absolute inset-0 bg-brand-blue-active/40 mix-blend-multiply z-10"></div>
                  <img src={imgCapacete} alt="Capacete NR-6" className="w-full h-full object-cover" />
                </div>
                {/* Luvas */}
                <div 
                  className="absolute bottom-[20%] right-[40%] w-48 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
                  style={{ transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)` }}
                >
                  <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10"></div>
                  <img src={imgLuvas} alt="Luvas de Segurança" className="w-full h-full object-cover" />
                </div>
              </>
            ) : (
              <>
                {/* Oculos */}
                <div 
                  className="absolute top-[15%] right-[20%] w-56 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
                  style={{ transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -25}px, 0)` }}
                >
                  <div className="absolute inset-0 bg-brand-blue-active/40 mix-blend-multiply z-10"></div>
                  <img src={imgOculos} alt="Óculos de Proteção" className="w-full h-full object-cover" />
                </div>
                {/* Respirador */}
                <div 
                  className="absolute bottom-[25%] right-[10%] w-48 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
                  style={{ transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)` }}
                >
                  <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10"></div>
                  <img src={imgRespirador} alt="Respirador" className="w-full h-full object-cover" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="flex items-center justify-center p-6 lg:p-12 w-full">
          {/* Logo only on mobile since left side is hidden */}
          <div className="absolute top-8 left-8 lg:hidden">
             <img src={brandLogo} alt="ItaSafety" className="h-10 bg-white rounded-md p-2" />
          </div>

          <div className="w-full max-w-md rounded-2xl bg-black/40 border border-white/10 p-8 sm:p-10 shadow-strong backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-2">
              {mode === 'login' && 'Login'}
              {mode === 'signup' && 'Criar Conta'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </h2>
            <p className="text-white/60 text-sm mb-8">
              {mode === 'login' && "Entre com seus dados para continuar."}
              {mode === 'signup' && "Preencha as informações para iniciar."}
              {mode === 'forgot' && "Enviaremos um link de acesso."}
            </p>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field label="E-mail" icon={<Mail className="size-4" />}>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30 text-white"
                  placeholder="voce@empresa.com.br"
                  disabled={loading}
                />
              </Field>

              {mode !== "forgot" && (
                <Field
                  label="Senha"
                  icon={<Lock className="size-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="text-white/40 hover:text-white flex items-center justify-center p-2"
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
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30 text-white"
                    placeholder="Mínimo de 8 caracteres"
                    disabled={loading}
                  />
                </Field>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between pt-2 pb-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70 hover:text-white">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 rounded border-white/20 bg-white/10 accent-brand-blue-light"
                    />
                    Lembrar acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm font-semibold text-brand-blue-light hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-blue py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-blue-hover disabled:opacity-60 mt-2"
              >
                {loading && <Loader2 className="size-4 animate-spin mx-auto" />}
                {!loading && mode === "login" && "Entrar"}
                {!loading && mode === "signup" && "Cadastrar"}
                {!loading && mode === "forgot" && "Enviar Link"}
              </button>
            </form>

            {mode === 'login' && (
              <>
                <div className="relative flex items-center py-8">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-4 text-xs font-medium text-white/50 uppercase tracking-wider">ou continue com</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59c1.47 0 2.81.57 3.82 1.49l3.12-3.12A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.52 0 10-4.48 10-10 0-.628-.068-1.242-.2-1.833h-11.55z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("apple")}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm font-medium text-white"
                  >
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.24-.57 2.98-1.43z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 text-center text-sm text-white/60">
              {mode === "login" && (
                <>
                  Não tem uma conta?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:underline font-bold">Cadastre-se</button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Já é registrado?{" "}
                  <button onClick={() => setMode("login")} className="text-white hover:underline font-bold">Entrar</button>
                </>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("login")} className="text-white hover:underline font-bold inline-flex items-center gap-1">
                   <ArrowLeft className="size-3" /> Voltar ao Login
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-6 text-xs text-white/40">
              <span className="hover:text-white/80 cursor-pointer transition-colors">Termos de Uso</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">Política de Privacidade</span>
              <span className="hover:text-white/80 cursor-pointer transition-colors">Suporte</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:left-12 lg:w-auto">
             <p className="flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-white/40">
               <ShieldCheck className="size-4" />
               Protegido por TLS · bcrypt · rate-limit · LGPD
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, trailing, children }: { label: string; icon: React.ReactNode; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 focus-within:border-brand-blue-light focus-within:bg-white/10 transition-colors min-h-[48px]">
        <div className="text-white/40">{icon}</div>
        {children}
        {trailing}
      </div>
    </label>
  );
}

async function recordAuthenticatedAttempt(
  recordAttempt: (input: { data: { attempt_type: AuthAttemptType; success?: true } }) => Promise<{ ok: boolean }>,
  attempt_type: AuthAttemptType,
) {
  try {
    await recordAttempt({ data: { attempt_type, success: true } });
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
