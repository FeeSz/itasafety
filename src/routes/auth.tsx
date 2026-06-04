import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";
import { Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () =>
    pageMeta({
      title: "Acesso administrativo — ItaSafety",
      description: "Acesso restrito para administradores ItaSafety.",
      path: "/auth",
      noindex: true,
    }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada. Verifique seu e-mail (se exigido) e faça login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-200px)] items-center justify-center bg-surface-sunken px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink">
          {mode === "login" ? "Acesso administrativo" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {mode === "login"
            ? "Entre para gerenciar produtos."
            : "O primeiro cadastro recebe permissão de administrador automaticamente."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              E-mail
            </span>
            <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 focus-within:border-brand-blue">
              <Mail className="size-4 text-ink-soft" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                placeholder="voce@empresa.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Senha
            </span>
            <div className="flex items-center gap-2 rounded-md border border-hairline bg-white px-3 focus-within:border-brand-blue">
              <Lock className="size-4 text-ink-soft" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-blue py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-60"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 block w-full text-center text-sm text-brand-blue hover:underline"
        >
          {mode === "login"
            ? "Não tem conta? Cadastrar-se"
            : "Já tenho conta — fazer login"}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-ink-soft hover:text-ink">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
