import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let previousUser: User | null = null;

    // Buscar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);
      previousUser = currentUser;

      if (currentUser) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id);
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      }
      setLoading(false);
    });

    // Escutar mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id);
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }

      setLoading(false);

      // Detectar login (SIGNED_IN e transição de nulo para usuário)
      if (event === "SIGNED_IN" && currentUser && !previousUser) {
        const provider = currentUser.app_metadata.provider || "";
        const name =
          currentUser.user_metadata.full_name || currentUser.email?.split("@")[0] || "Usuário";

        // Exibir toast personalizado "surpresa" pós-login
        showWelcomeToast(name, provider);
      }

      previousUser = currentUser;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function showWelcomeToast(name: string, provider: string) {
  // Ícone SVG correspondente ao provedor
  let iconSvg = null;
  if (provider === "google") {
    iconSvg = (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59c1.47 0 2.81.57 3.82 1.49l3.12-3.12A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.52 0 10-4.48 10-10 0-.628-.068-1.242-.2-1.833h-11.55z"
        />
      </svg>
    );
  } else if (provider === "apple") {
    iconSvg = (
      <svg className="h-5 w-5 shrink-0 fill-current text-black dark:text-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.24-.57 2.98-1.43z" />
      </svg>
    );
  } else {
    // Provedor padrão (e-mail)
    iconSvg = (
      <svg
        className="h-5 w-5 text-brand-blue"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    );
  }

  // Exibir o Toast customizado premium com animação e glassmorphism
  toast.custom(
    (t) => (
      <div className="flex w-full max-w-sm items-center gap-3.5 rounded-2xl border border-white/40 bg-white/90 backdrop-blur-md p-4 shadow-strong transition-all duration-300 dark:border-white/10 dark:bg-slate-900/90 animate-slide-down">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          {iconSvg}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-ink dark:text-white">Bem-vindo de volta!</h4>
          <p className="text-xs text-ink-muted dark:text-slate-400">
            Olá, {name}. Acesso liberado.
          </p>
        </div>
      </div>
    ),
    {
      duration: 4000,
    },
  );
}
