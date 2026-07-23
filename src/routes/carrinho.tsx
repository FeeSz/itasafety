import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, Loader2, CheckCircle2, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
  empresa: z.string().trim().min(2, "Informe a empresa"),
  cnpj: z.string().trim().optional(),
  telefone: z.string().trim().min(8, "Telefone inválido"),
  observacoes: z.string().trim().max(2000).optional(),
});

type FormData = z.infer<typeof formSchema>;
type FieldErrors = Partial<Record<keyof FormData, string>>;
type Step = "review" | "form" | "success";

const STEPS: { key: Step; label: string }[] = [
  { key: "review", label: "Revisar itens" },
  { key: "form", label: "Dados da empresa" },
  { key: "success", label: "Confirmação" },
];

function CarrinhoPage() {
  const { items, remove, setQty, clear, syncing } = useQuoteCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: empresa, isLoading: loadingEmpresa } = useQuery({
    queryKey: ["empresa", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("empresas")
        .select("status, razao_social, cnpj, telefone_contato")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [step, setStep] = useState<Step>("review");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [cotacaoNum, setCotacaoNum] = useState<number | null>(null);

  const maskPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2 && val.length <= 6) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    else if (val.length > 6 && val.length < 11) val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
    else if (val.length === 11) val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    e.target.value = val;
  };

  const maskCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    let masked = digits;
    if (digits.length > 14) masked = digits.slice(0, 14);
    if (masked.length > 2) masked = `${masked.slice(0, 2)}.${masked.slice(2)}`;
    if (masked.length > 6) masked = `${masked.slice(0, 6)}.${masked.slice(6)}`;
    if (masked.length > 10) masked = `${masked.slice(0, 10)}/${masked.slice(10)}`;
    if (masked.length > 15) masked = `${masked.slice(0, 15)}-${masked.slice(15)}`;
    e.target.value = masked;
  };

  const maskEmpresaOuCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Se só tiver números e pontuação de CNPJ, formata como CNPJ
    if (/^[\d.\-\/]+$/.test(val)) {
      maskCnpj(e);
    }
  };

  // ── Form submit ─────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    if (items.length === 0) {
      toast.error("O carrinho está vazio. Adicione itens antes de enviar.");
      return;
    }

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
          user_id: user.id,
          empresa: parsed.data.empresa,
          cnpj: parsed.data.cnpj ?? null,
          nome_contato: user.user_metadata?.full_name ?? user.email ?? "—",
          telefone: parsed.data.telefone,
          email_contato: user.email ?? "",
          observacoes: parsed.data.observacoes ?? null,
        })
        .select("id, numero_cotacao")
        .single();

      if (cotErr || !cotacao) throw cotErr ?? new Error("Erro ao criar cotação");

      // 2. Insert snapshot de itens
      const itensSql = items.map((i) => ({
        cotacao_id: cotacao.id,
        sku: i.sku,
        nome: i.name,
        categoria: i.category,
        ca_number: i.ca_number ?? null,
        image_url: i.image,
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
      <section className="flex min-h-[70vh] items-center justify-center">
        <Container className="max-w-md text-center">
          <Reveal>
            <div className="flex justify-center">
              <div className="grid size-24 place-items-center rounded-full bg-green-50 ring-8 ring-green-50/60">
                <CheckCircle2 className="size-12 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="mt-7 font-display text-3xl font-black tracking-tight text-ink">
              Cotação enviada!
            </h1>
            {cotacaoNum && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-blue-tint px-3 py-1 font-mono text-xs font-bold tracking-wide text-brand-blue">
                Nº {String(cotacaoNum).padStart(4, "0")}
              </p>
            )}
            <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-ink-muted">
              Nossa equipe analisa e responde em até{" "}
              <strong className="font-semibold text-ink">24h úteis</strong> no e-mail cadastrado.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-blue px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-blue-hover hover:shadow-md"
              >
                Continuar navegando
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
      <section className="flex min-h-[70vh] items-center justify-center">
        <Container className="max-w-sm text-center">
          <Reveal>
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-surface-sunken">
              <ShoppingCart className="size-9 text-ink-soft" strokeWidth={1.3} />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
              Sua cotação ainda está vazia
            </h1>
            <p className="mx-auto mt-2 max-w-[26ch] text-sm leading-relaxed text-ink-muted">
              Adicione EPIs do catálogo para montar sua solicitação de cotação.
            </p>
            <Link
              to="/categorias"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-blue-hover hover:shadow-md"
            >
              Ver catálogo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </Container>
      </section>
    );
  }

  // ── Auth gate (not logged in) ───────────────────────────────────────────────
  if (!user && step !== "review") {
    return null;
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-hairline bg-surface-sunken pb-9 pt-24 md:pt-32">
        <Container>
          <Reveal>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">
              Minha Cotação
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
              {step === "review"
                ? `${items.length} ${items.length === 1 ? "item" : "itens"} selecionados`
                : "Dados para contato"}
            </h1>
          </Reveal>

          {/* Steps indicator */}
          <div className="mt-7 flex items-center">
            {STEPS.map((s, idx) => {
              const currentIdx = STEPS.findIndex((x) => x.key === step);
              const isDone = idx < currentIdx;
              const isActive = idx === currentIdx;
              const isLast = idx === STEPS.length - 1;

              return (
                <div key={s.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={[
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                        isDone
                          ? "bg-brand-blue text-white"
                          : isActive
                            ? "bg-brand-blue text-white ring-4 ring-brand-blue/15"
                            : "bg-white text-ink-soft ring-1 ring-inset ring-hairline",
                      ].join(" ")}
                    >
                      {isDone ? <CheckCircle2 className="size-4" /> : idx + 1}
                    </div>
                    <span
                      className={`hidden text-sm font-semibold sm:inline ${isActive ? "text-ink" : isDone ? "text-ink-muted" : "text-ink-soft"
                        }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`mx-3 h-px flex-1 transition-colors ${isDone ? "bg-brand-blue" : "bg-hairline"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">

            {/* ── LEFT: Items list ───────────────────────────────────────── */}
            <div>
              {step === "review" && (
                <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-card">
                  {syncing && (
                    <div className="flex items-center gap-2 border-b border-hairline bg-brand-blue-tint px-5 py-2.5 text-sm font-medium text-brand-blue">
                      <Loader2 className="size-3.5 animate-spin" />
                      Sincronizando carrinho...
                    </div>
                  )}
                  <ul className="divide-y divide-hairline">
                    {items.map((item) => (
                      <li
                        key={item.sku}
                        className="flex gap-4 p-5 transition-colors hover:bg-surface-sunken/60"
                      >
                        <img
                          src={item.image || "/placeholder.png"}
                          alt=""
                          className="size-20 shrink-0 rounded-xl border border-hairline bg-surface-sunken object-contain p-2"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                            {item.category}
                          </p>
                          <p className="mt-0.5 font-semibold leading-snug text-ink">
                            {item.name}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                            <span>SKU: {item.sku}</span>
                            {item.ca_number && <span>CA: {item.ca_number}</span>}
                          </div>

                          <div className="mt-3.5 flex items-center gap-4">
                            {/* Qty controls */}
                            <div className="inline-flex items-center overflow-hidden rounded-lg border border-hairline">
                              <button
                                type="button"
                                onClick={() => setQty(item.sku, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="grid size-9 place-items-center text-ink-muted transition hover:bg-surface-sunken hover:text-brand-blue disabled:opacity-30 disabled:hover:bg-transparent"
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
                                className="w-12 border-x border-hairline bg-white py-1.5 text-center text-sm font-semibold text-ink focus:outline-none"
                                aria-label={`Quantidade de ${item.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => setQty(item.sku, item.qty + 1)}
                                className="grid size-9 place-items-center text-ink-muted transition hover:bg-surface-sunken hover:text-brand-blue"
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
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft transition hover:text-brand-red"
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
                  className="space-y-6 rounded-2xl border border-hairline bg-white p-8 shadow-card"
                >
                  <div className="space-y-2">
                    <label htmlFor="empresa" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-soft">
                      <span>Empresa / Razão Social *</span>
                      {!!empresa && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="size-3" /> Conta Verificada</span>}
                    </label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      autoComplete="organization"
                      placeholder="Ex: Indústria ABC Ltda"
                      defaultValue={empresa?.razao_social || ""}
                      readOnly={!!empresa}
                      onChange={maskEmpresaOuCnpj}
                      className={[
                        "w-full rounded-lg border bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-soft/50",
                        !!empresa ? "bg-surface-sunken text-ink-muted cursor-not-allowed border-hairline" : fieldErrors.empresa
                          ? "border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                          : "border-hairline focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15",
                      ].join(" ")}
                      aria-invalid={!!fieldErrors.empresa}
                    />
                    {fieldErrors.empresa && (
                      <p className="text-xs font-medium text-brand-red">{fieldErrors.empresa}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="cnpj" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                        CNPJ <span className="normal-case font-medium text-ink-soft/70">(opcional)</span>
                      </label>
                      <input
                        id="cnpj"
                        name="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        defaultValue={empresa?.cnpj || ""}
                        readOnly={!!empresa}
                        onChange={maskCnpj}
                        className={`w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 ${!!empresa ? "bg-surface-sunken text-ink-muted cursor-not-allowed" : ""}`}
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
                        placeholder="(00) 00000-0000"
                        defaultValue={empresa?.telefone_contato || ""}
                        readOnly={!!empresa}
                        onChange={maskPhone}
                        className={[
                          "w-full rounded-lg border bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-soft/50",
                          !!empresa ? "bg-surface-sunken text-ink-muted cursor-not-allowed border-hairline" : fieldErrors.telefone
                            ? "border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
                            : "border-hairline focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15",
                        ].join(" ")}
                        aria-invalid={!!fieldErrors.telefone}
                      />
                      {fieldErrors.telefone && (
                        <p className="text-xs font-medium text-brand-red">{fieldErrors.telefone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="observacoes" className="block text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Observações <span className="normal-case font-medium text-ink-soft/70">(prazo, normas, outros requisitos)</span>
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      rows={4}
                      placeholder="Conte um pouco mais sobre o que você precisa..."
                      className="w-full resize-none rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    />
                  </div>

                  {/* Pre-fill notice */}
                  <div className="flex items-start gap-2 rounded-lg bg-surface-sunken px-4 py-3 text-xs text-ink-soft">
                    <span>
                      Nome e e-mail serão enviados automaticamente da sua conta:{" "}
                      <strong className="font-semibold text-ink">{user?.email}</strong>
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* ── RIGHT: Summary + CTA ───────────────────────────────────── */}
            <div className="h-fit rounded-2xl border border-hairline bg-white p-6 shadow-card sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Resumo</h2>
                <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-bold text-ink-soft">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </span>
              </div>

              <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                {items.map((row: any) => (
                  <div key={row.sku} className="flex items-center justify-between text-sm">
                    <span className="max-w-[180px] truncate text-ink-muted">{row.name}</span>
                    <span className="ml-2 shrink-0 rounded-md bg-surface-sunken px-2 py-0.5 text-xs font-bold text-ink">
                      {row.qty}x
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-hairline" />

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total</span>
                <p className="text-sm">
                  <strong className="font-black text-ink">{items.reduce((a, i) => a + i.qty, 0)}</strong>{" "}
                  <span className="text-ink-soft">unidades</span>
                </p>
              </div>

              {/* Auth gate */}
              {!user && step !== "form" && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-semibold text-amber-900">Faça login para finalizar</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Sua cotação é salva automaticamente após o login.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/auth", search: { next: "/carrinho", mode: "login" } })}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
                  >
                    <LogIn className="size-4" /> Entrar / Criar conta
                  </button>
                </div>
              )}

              {/* Status da Empresa gate */}
              {user && !loadingEmpresa && (!empresa || empresa.status !== "aprovada") && step === "review" && (
                <div className={`mt-5 rounded-xl border p-4 text-sm ${empresa?.status === "pendente_aprovacao" ? "border-amber-200 bg-amber-50" : empresa?.status === "rejeitada" ? "border-red-200 bg-red-50" : "border-brand-blue/20 bg-brand-blue-tint"}`}>
                  <p className={`font-semibold ${empresa?.status === "pendente_aprovacao" ? "text-amber-900" : empresa?.status === "rejeitada" ? "text-red-900" : "text-brand-blue"}`}>
                    {empresa?.status === "pendente_aprovacao" ? "Cadastro em análise" : empresa?.status === "rejeitada" ? "Cadastro não aprovado" : "Complete seu perfil"}
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed ${empresa?.status === "pendente_aprovacao" ? "text-amber-700" : empresa?.status === "rejeitada" ? "text-red-700" : "text-brand-blue/80"}`}>
                    {empresa?.status === "pendente_aprovacao" ? "Você poderá enviar cotações assim que sua empresa for aprovada." : empresa?.status === "rejeitada" ? "Seu cadastro de empresa foi rejeitado." : "Você precisa cadastrar os dados da sua empresa antes de enviar cotações."}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/perfil" })}
                    className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold shadow-sm transition ${empresa?.status === "pendente_aprovacao" ? "bg-amber-600 text-white hover:bg-amber-700" : empresa?.status === "rejeitada" ? "bg-red-600 text-white hover:bg-red-700" : "bg-brand-blue text-white hover:bg-brand-blue-hover"}`}
                  >
                    <Building2 className="size-4" /> Acessar Meu Perfil
                  </button>
                </div>
              )}

              {/* Actions */}
              {user && step === "review" && empresa?.status === "aprovada" && (
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  disabled={items.length === 0}
                  className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-blue-hover hover:shadow-md disabled:opacity-50"
                >
                  Continuar
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}

              {step === "form" && (
                <>
                  <button
                    type="submit"
                    form="cotacao-form"
                    disabled={submitting}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red-dark hover:shadow-md disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Cotação
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    disabled={submitting}
                    className="mt-2.5 w-full text-center text-xs font-medium text-ink-soft underline-offset-2 transition hover:text-ink hover:underline disabled:opacity-50"
                  >
                    ← Voltar para revisão
                  </button>
                </>
              )}

              <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
                🔒 Seus dados são protegidos pelo LGPD
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}