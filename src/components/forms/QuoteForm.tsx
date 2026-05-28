import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ArrowRight } from "lucide-react";

const schema = z.object({
  company: z.string().trim().min(2, "Informe o nome da empresa").max(120),
  name: z.string().trim().min(2, "Informe seu nome").max(80),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  message: z.string().trim().min(10, "Descreva sua necessidade").max(2000),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export default function QuoteForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const { company, name, email, phone, message } = parsed.data;
    const body = encodeURIComponent(
      `Empresa: ${company}\nNome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\n${message}`,
    );
    window.location.href = `mailto:contato@itasafety.com.br?subject=Solicitação de Orçamento&body=${body}`;
    setSent(true);
  }

  const label =
    "block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft";
  const input =
    "w-full rounded-sm border border-hairline bg-white px-4 py-3 text-ink font-medium outline-none transition-colors focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 placeholder:text-ink-soft/60";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6 rounded-md border border-hairline bg-white p-8 shadow-card md:p-10"
      aria-label="Formulário de solicitação de orçamento"
    >
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
          Cotação Técnica
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
          Solicite seu orçamento
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Resposta em até 24h úteis. Todos os campos são obrigatórios.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className={label}>
          Empresa / CNPJ
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          className={input}
          aria-invalid={!!errors.company}
        />
        {errors.company && <p className="text-xs text-brand-red">{errors.company}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className={label}>
            Seu Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className={input}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-brand-red">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={label}>
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={input}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-brand-red">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className={label}>
          E-mail Corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={input}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-brand-red">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className={label}>
          Necessidade Técnica
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${input} resize-none`}
          placeholder="Itens, quantidades, normas aplicáveis, prazo..."
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-brand-red">{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-[0_2px_0_oklch(0.40_0.18_25)] transition-all hover:bg-brand-red-dark hover:shadow-none active:scale-[0.99]"
      >
        Enviar Solicitação
        <ArrowRight className="size-4" aria-hidden />
      </button>

      {sent && (
        <p role="status" className="text-center text-sm text-ink-muted">
          Abrimos seu cliente de e-mail. Caso prefira, fale conosco pelo WhatsApp.
        </p>
      )}
    </form>
  );
}
