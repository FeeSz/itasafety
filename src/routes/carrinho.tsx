import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, Loader2, CheckCircle2, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
export const Route = createFileRoute("/carrinho")({
  head: () =>
    pageMeta({
      title: "Minha Cotação — ItaSafety",
      description:
        "Revise os EPIs selecionados e finalize sua solicitação de cotação à equipe comercial da ItaSafety.",
      path: "/carrinho",
    }),
  component: CarrinhoPage,
});

const formSchema = z.object({
  empresa:    z.string().trim().min(2, "Informe a empresa"),
  cnpj:       z.string().trim().optional(),
  telefone:   z.string().trim().min(8, "Telefone inválido"),
  observacoes: z.string().trim().max(2000).optional(),
});

type FormData = z.infer<typeof formSchema>;
type FieldErrors = Partial<Record<keyof FormData, string>>;
type Step = "review" | "form" | "success";

function CarrinhoPage() {
  const { items, remove, setQty, clear, syncing } = useQuoteCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("review");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [cotacaoNum, setCotacaoNum] = useState<number | null>(null);

  // ── Form submit ─────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = formSchema.safeParse(fd);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      // 1. Insert cotação header
      const { data: cotacao, error: cotErr } = await (supabase as any)
        .from("cotacoes")
        .insert({
          user_id:        user.id,
          empresa:        parsed.data.empresa,
          cnpj:           parsed.data.cnpj ?? null,
          nome_contato:   user.user_metadata?.full_name ?? user.email ?? "—",
          telefone:       parsed.data.telefone,
          email_contato:  user.email ?? "",
          observacoes:    parsed.data.observacoes ?? null,
        })
        .select("id, numero_cotacao")
        .single();

      if (cotErr || !cotacao) throw cotErr ?? new Error("Erro ao criar cotação");

      // 2. Insert snapshot de itens
      const itensSql = items.map((i) => ({
        cotacao_id: cotacao.id,
        sku:        i.sku,
        nome:       i.name,
        categoria:  i.category,
        ca_number:  i.ca_number ?? null,
        image_url:  i.image,
        quantidade: i.qty,
      }));

      const { error: itemErr } = await (supabase as any)
        .from("cotacao_itens")
        .insert(itensSql);

      if (itemErr) throw itemErr;

      // 3. Invocar a Edge Function unificada
      const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
        "enviar-notificacao-cotacao",
        {
          body: {
            acao: "nova_cotacao",
            cotacao_id: cotacao.id,
          },
        }
      );

      if (edgeErr) throw edgeErr;

      // Tratamento de HTTP 207 (Multi-Status: salvo, mas email falhou) ou HTTP 200 (ok)
      // O Supabase JS lança erro apenas se o status >= 400. Então 207 cai aqui no sucesso.
      if (edgeData?.warning) {
        toast.warning(edgeData.warning, { duration: 6000 });
      } else {
        toast.success("Cotação enviada com sucesso!");
      }

      // 4. Clear cart
      clear();
      setCotacaoNum(cotacao.numero_cotacao);
      setStep("success");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar cotação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Container className="max-w-md text-center">
          <Reveal>
            <div className="flex justify-center">
              <CheckCircle2 className="size-20 text-green-500" strokeWidth={1.2} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-black text-ink">
              Cotação enviada!
            </h1>
            {cotacaoNum && (
              <p className="mt-2 font-mono text-sm text-brand-blue font-bold">
                Número #{String(cotacaoNum).padStart(4, "0")}
              </p>
            )}
            <p className="mt-4 text-ink-muted">
              Nossa equipe analisa e responde em até{" "}
              <strong className="text-ink">24h úteis</strong> no e-mail cadastrado.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-hover"
              >
                Continuar navegando <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0 && step === "review") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Container className="max-w-sm text-center">
          <Reveal>
            <ShoppingCart className="mx-auto size-16 text-ink-soft" strokeWidth={1.2} />
            <h1 className="mt-6 text-2xl font-bold text-ink">Sua cotação está vazia</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Adicione EPIs do catálogo para solicitar uma cotação.
            </p>
            <Link
              to="/categorias"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-hover"
            >
              Ver catálogo <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </Container>
      </section>
    );
  }

  // ── Auth gate (not logged in) ───────────────────────────────────────────────
  if (!user && step !== "review") {
    return null; // Should not happen, guard in onContinue
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-hairline bg-surface-sunken pb-8 pt-24 md:pt-32">
        <Container>
          <Reveal>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">
              Minha Cotação
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
              {step === "review" ? `${items.length} ${items.length === 1 ? "item" : "itens"} selecionados` : "Dados para contato"}
            </h1>
          </Reveal>

          {/* Steps indicator */}
          <div className="mt-6 flex items-center gap-3 text-sm">
            <span className={`font-semibold ${step === "review" ? "text-brand-blue" : "text-ink-soft"}`}>
              1. Revisar itens
            </span>
            <span className="text-hairline">→</span>
            <span className={`font-semibold ${step === "form" ? "text-brand-blue" : "text-ink-soft"}`}>
              2. Dados da empresa
            </span>
            <span className="text-hairline">→</span>
            <span className={`font-semibold ${(step as string) === "success" ? "text-green-600" : "text-ink-soft"}`}>
              3. Confirmação
            </span>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">

            {/* ── LEFT: Items list ───────────────────────────────────────── */}
            <div>
              {step === "review" && (
                <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
                  {syncing && (
                    <div className="flex items-center gap-2 border-b border-hairline bg-brand-blue-tint px-5 py-2.5 text-sm text-brand-blue">
                      <Loader2 className="size-3.5 animate-spin" />
                      Sincronizando carrinho...
                    </div>
                  )}
                  <ul className="divide-y divide-hairline">
                    {items.map((item) => (
                      <li key={item.sku} className="flex gap-4 p-5">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt=""
                          className="size-20 shrink-0 rounded-lg bg-surface-sunken object-contain p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                            {item.category}
                          </p>
                          <p className="mt-0.5 font-semibold text-ink leading-snug">
                            {item.name}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-soft">
                            <span>SKU: {item.sku}</span>
                            {item.ca_number && <span>CA: {item.ca_number}</span>}
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            {/* Qty controls */}
                            <div className="inline-flex items-center rounded-lg border border-hairline">
                              <button
                                type="button"
                                onClick={() => setQty(item.sku, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="grid size-8 place-items-center text-ink-muted transition hover:text-brand-blue disabled:opacity-30"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={9999}
                                value={item.qty}
                                onChange={(e) =>
                                  setQty(item.sku, parseInt(e.target.value || "1", 10))
                                }
                                className="w-12 border-x border-hairline py-1 text-center text-sm font-medium focus:outline-none"
                                aria-label={`Quantidade de ${item.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => setQty(item.sku, item.qty + 1)}
                                className="grid size-8 place-items-center text-ink-muted transition hover:text-brand-blue"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                remove(item.sku);
                                toast("Item removido da cotação");
                              }}
                              className="inline-flex items-center gap-1 text-xs text-ink-soft transition hover:text-brand-red"
                            >
                              <Trash2 className="size-3.5" /> Remover
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === "form" && (
                <form
                  id="cotacao-form"
                  onSubmit={onSubmit}
                  className="space-y-5 rounded-xl border border-hairline bg-white p-8 shadow-card"
                >
                  <div className="space-y-2">
                    <label htmlFor="empresa" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Empresa / Razão Social *
                    </label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      autoComplete="organization"
                      className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                      aria-invalid={!!fieldErrors.empresa}
                    />
                    {fieldErrors.empresa && (
                      <p className="text-xs text-brand-red">{fieldErrors.empresa}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="cnpj" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                        CNPJ
                      </label>
                      <input
                        id="cnpj"
                        name="cnpj"
                        type="text"
                        className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        id="telefone"
                        name="telefone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                        aria-invalid={!!fieldErrors.telefone}
                      />
                      {fieldErrors.telefone && (
                        <p className="text-xs text-brand-red">{fieldErrors.telefone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="observacoes" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Observações (prazo, normas, outros requisitos)
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    />
                  </div>

                  {/* Pre-fill notice */}
                  <p className="text-xs text-ink-soft">
                    Nome e e-mail serão enviados automaticamente da sua conta:{" "}
                    <strong>{user?.email}</strong>
                  </p>
                </form>
              )}
            </div>

            {/* ── RIGHT: Summary + CTA ───────────────────────────────────── */}
            <div className="h-fit rounded-xl border border-hairline bg-white p-6 shadow-card sticky top-24">
              <h2 className="font-display text-lg font-bold text-ink">Resumo</h2>

              <div className="mt-4 space-y-2">
                {items.map((row: any) => (
                  <div key={row.sku} className="flex justify-between text-sm">
                    <span className="text-ink-muted truncate max-w-[180px]">{row.name}</span>
                    <span className="font-semibold text-ink shrink-0 ml-2">{row.qty}x</span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-hairline" />

              <p className="text-xs text-ink-soft">
                Total: <strong className="text-ink">{items.reduce((a, i) => a + i.qty, 0)} unidades</strong> · {items.length} {items.length === 1 ? "produto" : "produtos"}
              </p>

              {/* Auth gate */}
              {!user && step !== "form" && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-semibold text-amber-800">Faça login para finalizar</p>
                  <p className="mt-1 text-amber-700 text-xs">
                    Sua cotação é salva automaticamente após o login.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/auth", search: { next: "/carrinho", mode: "login" } })}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
                  >
                    <LogIn className="size-4" /> Entrar / Criar conta
                  </button>
                </div>
              )}

              {/* Actions */}
              {user && step === "review" && (
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  disabled={items.length === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-blue-hover disabled:opacity-50"
                >
                  Continuar <ArrowRight className="size-4" />
                </button>
              )}

              {step === "form" && (
                <>
                  <button
                    type="submit"
                    form="cotacao-form"
                    disabled={submitting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red-dark disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Cotação <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="mt-2 w-full text-center text-xs text-ink-soft underline hover:text-ink"
                  >
                    ← Voltar para revisão
                  </button>
                </>
              )}

              <p className="mt-4 text-center text-xs text-ink-soft">
                🔒 Seus dados são protegidos pelo LGPD.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
