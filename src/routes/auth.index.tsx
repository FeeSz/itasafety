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
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { checkAuthRateLimit, recordAuthAttempt } from "@/lib/auth.functions";

type Mode = "login" | "signup" | "forgot";
type AuthAttemptType = "login" | "signup" | "reset";

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

  const [capsLockActive, setCapsLockActive] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

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

    const remembered =
      typeof window !== "undefined" ? localStorage.getItem("ita_remember_email") : null;
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
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      // O browser será redirecionado para o provider.
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#111] text-white">
        <div className="text-center p-8 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-blue/20">
            <CheckCircle2 className="size-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {successView === "signup" ? "Verifique seu e-mail" : "Pedido enviado"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
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
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] bg-[#111111] text-white overflow-hidden items-center justify-center p-6 lg:p-12 font-sans">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[#1B4F8A]/30 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-[#6B21A8]/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Welcome Text and 3D Floating Element */}
        <div className="flex flex-col text-left">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white drop-shadow-md">
            {mode === 'login' && 'Bem-vindo\nde volta !'}
            {mode === 'signup' && 'Prepare-se\npara entrar !'}
            {mode === 'forgot' && 'Recuperar\nAcesso !'}
          </h1>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 bg-white/5 w-fit font-medium hover:bg-white/10 transition-colors backdrop-blur-md mb-8 text-sm"
          >
            Pular a espera ?
          </Link>

          {/* 3D Floating Element Container */}
          <div className="relative h-64 md:h-96 w-full lg:w-4/5 mx-auto lg:mx-0 perspective-1000 hidden md:block">
            <div className="absolute inset-0 animate-float-3d flex items-center justify-center">
               {mode === 'login' ? (
                 <img 
                   src="/epi_3d/helmet.png" 
                   alt="EPI 3D" 
                   className="w-[120%] h-[120%] object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                 />
               ) : (
                 <img 
                   src="/epi_3d/boot.png" 
                   alt="EPI 3D" 
                   className="w-[110%] h-[110%] object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                 />
               )}
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Card */}
        <div className="relative w-full max-w-md mx-auto lg:ml-auto">
          <div className="rounded-3xl bg-[#1A1A1A]/60 border border-white/10 p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold mb-1">
              {mode === 'login' && 'Login'}
              {mode === 'signup' && 'Signup'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </h2>
            <p className="text-slate-400 text-xs mb-8">
              {mode === 'login' && "Glad you're back.!"}
              {mode === 'signup' && "Just some details to get you in.!"}
              {mode === 'forgot' && "We'll send you a link to get back in.!"}
            </p>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field label="Username / E-mail" icon={<Mail className="size-4" />}>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/20 text-white"
                  placeholder="voce@empresa.com.br"
                  disabled={loading}
                />
              </Field>

              {mode !== "forgot" && (
                <Field
                  label="Password"
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
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/20 text-white"
                    placeholder="Sua senha"
                    disabled={loading}
                  />
                </Field>
              )}

              {mode === "login" && (
                <div className="flex items-center pt-2 pb-1">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-3.5 rounded border-white/20 bg-[#2A2A2A] accent-[#7C3AED]"
                    />
                    Remember me
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#6B21A8] to-[#1B4F8A] py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 mt-4"
              >
                {loading && <Loader2 className="size-4 animate-spin mx-auto" />}
                {!loading && mode === "login" && "Login"}
                {!loading && mode === "signup" && "Signup"}
                {!loading && mode === "forgot" && "Enviar Link"}
              </button>
              
              {mode === "login" && (
                 <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-slate-300 hover:text-white"
                    >
                      Forgot password ?
                    </button>
                 </div>
              )}
            </form>

            {mode === 'login' && (
              <>
                <div className="relative flex items-center py-6">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-4 text-xs font-medium text-slate-500 uppercase">Or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={loading}
                    className="grid size-10 place-items-center rounded-full bg-black/40 border border-white/10 hover:bg-black/60 transition-colors disabled:opacity-50"
                    title="Login with Google"
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59c1.47 0 2.81.57 3.82 1.49l3.12-3.12A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.52 0 10-4.48 10-10 0-.628-.068-1.242-.2-1.833h-11.55z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("apple")}
                    disabled={loading}
                    className="grid size-10 place-items-center rounded-full bg-black/40 border border-white/10 hover:bg-black/60 transition-colors disabled:opacity-50 text-white"
                    title="Login with Apple"
                  >
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.24-.57 2.98-1.43z" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 text-center text-[11px] text-slate-400">
              {mode === "login" && (
                <>
                  Don't have an account ?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:underline font-semibold">Signup</button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already Registered ?{" "}
                  <button onClick={() => setMode("login")} className="text-white hover:underline font-semibold">Login</button>
                </>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("login")} className="text-white hover:underline font-semibold">Back to Login</button>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-4 text-[10px] text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
              <span className="hover:text-slate-300 cursor-pointer">Support</span>
              <span className="hover:text-slate-300 cursor-pointer">Customer Care</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, trailing, children }: { label: string; icon: React.ReactNode; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="block">
      {/* Label missing in reference image next to field? Actually the reference shows labels INSIDE or ABOVE the field borders */}
      {/* Wait, the reference image shows the label "Username" inside the input border as a placeholder or floating label. We'll simulate it by placing a small text above. Wait, the image shows it inside. Let's just use it as a placeholder. No, it has an empty border with text inside. */}
      <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-transparent px-4 focus-within:border-white/50 transition-colors min-h-[44px]">
        {/* <div className="text-white/40">{icon}</div> */}
        {/* In the image there are no icons inside the inputs! So I'll remove icon rendering to match the image exactly */}
        {children}
        {trailing}
      </div>
    </div>
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
