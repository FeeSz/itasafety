import { useState, useRef, type FormEvent } from "react";
import { z } from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import DemandChips from "@/components/ui/DemandChips";
import FormSuccess from "@/components/ui/FormSuccess";

// ─── EmailJS config ─────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_qz2af8x";
const EMAILJS_TEMPLATE_ID_COTACAO = "template_wdyquq6";
const EMAILJS_TEMPLATE_ID_RESET_SENHA = "template_zxjeqan";
const EMAILJS_PUBLIC_KEY  = "KUpCqP8GI8O64tYfB";
// ────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  demand_type: z.string().min(1),
  company:     z.string().trim().min(2, "Informe o nome da empresa").max(120),
  name:        z.string().trim().min(2, "Informe seu nome").max(80),
  email:       z.string().trim().email("E-mail inválido").max(160),
  phone:       z.string().trim().min(8, "Telefone inválido").max(20),
  message:     z.string().trim().min(10, "Descreva sua necessidade").max(2000),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;
type Status = "idle" | "loading" | "success" | "error";

// Floating-label input component
function FloatingInput({
  id,
  name,
  type = "text",
  label,
  autoComplete,
  inputMode,
  error,
  rows,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  rows?: number;
}) {
  const base =
    "peer w-full rounded-lg border bg-white px-4 pb-3 pt-6 text-sm font-medium text-ink outline-none transition-all duration-150 placeholder-transparent " +
    "border-hairline focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 " +
    (error ? "border-brand-red focus:border-brand-red focus:ring-brand-red/15" : "");

  const labelCls =
    "pointer-events-none absolute left-4 top-4 origin-left text-sm text-ink-soft transition-all duration-150 " +
    "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 " +
    "peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-brand-blue " +
    "peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-[0.75] " +
    (error ? "peer-focus:text-brand-red" : "");

  return (
    <div className="relative">
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder=" "
          className={`${base} resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder=" "
          className={base}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-brand-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function QuoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [status,  setStatus]  = useState<Status>("idle");
  const [errMsg,  setErrMsg]  = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data   = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      // Scroll to first error
      const firstEl = e.currentTarget.querySelector("[aria-invalid='true']");
      (firstEl as HTMLElement)?.focus();
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_COTACAO,
        formRef.current!,
        EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
    } catch {
      setStatus("error");
      setErrMsg("Não foi possível enviar. Tente novamente ou ligue para (11) 5178-5655.");
    }
  }

  if (status === "success") return <FormSuccess />;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-label="Formulário de solicitação de orçamento"
    >
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
          Cotação Técnica
        </p>
        <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
          Solicite seu orçamento
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Resposta em até{" "}
          <span className="font-semibold text-ink">24h úteis</span>.
        </p>
      </div>

      {/* Demand chips */}
      <DemandChips />

      {/* Company */}
      <FloatingInput
        id="company"
        name="company"
        label="Empresa / CNPJ"
        autoComplete="organization"
        error={errors.company}
      />

      {/* Name + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput
          id="name"
          name="name"
          label="Seu Nome"
          autoComplete="name"
          error={errors.name}
        />
        <FloatingInput
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          label="Telefone / WhatsApp"
          autoComplete="tel"
          error={errors.phone}
        />
      </div>

      {/* Email */}
      <FloatingInput
        id="email"
        name="email"
        type="email"
        label="E-mail Corporativo"
        autoComplete="email"
        error={errors.email}
      />

      {/* Message */}
      <FloatingInput
        id="message"
        name="message"
        label="Necessidade Técnica (itens, quantidades, normas, prazo...)"
        error={errors.message}
        rows={4}
      />

      {/* Error global */}
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red" role="alert">
          {errMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-[0_2px_0_oklch(0.40_0.18_25)] transition-all hover:bg-brand-red-dark hover:shadow-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando...
          </>
        ) : (
          <>
            Enviar Solicitação
            <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </button>

      <p className="text-center text-xs text-ink-soft">
        🔒 Seus dados são protegidos e não serão compartilhados.
      </p>
    </form>
  );
}
