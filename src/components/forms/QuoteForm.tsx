import { useState, type FormEvent } from "react";
import { z } from "zod";

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

  const label = "block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/50";
  const input =
    "w-full bg-brand-navy-deep border-b-2 border-white/15 px-0 py-3 text-white font-medium outline-none transition-colors focus:border-brand-red placeholder:text-white/30";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6 border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10"
      aria-label="Formulário de solicitação de orçamento"
    >
      <div className="space-y-2">
        <label htmlFor="company" className={label}>Empresa / CNPJ</label>
        <input id="company" name="company" type="text" autoComplete="organization" className={input} aria-invalid={!!errors.company} />
        {errors.company && <p className="text-xs text-brand-red">{errors.company}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className={label}>Seu Nome</label>
          <input id="name" name="name" type="text" autoComplete="name" className={input} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-brand-red">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={label}>Telefone</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={input} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-xs text-brand-red">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className={label}>E-mail Corporativo</label>
        <input id="email" name="email" type="email" autoComplete="email" className={input} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-brand-red">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className={label}>Necessidade Técnica</label>
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
        className="w-full bg-brand-red py-5 font-display text-base font-bold uppercase tracking-tighter text-white transition-colors hover:bg-brand-red-dark active:scale-[0.98]"
      >
        Enviar Solicitação
      </button>

      {sent && (
        <p role="status" className="text-center text-sm text-white/70">
          Abrimos seu cliente de e-mail. Caso prefira, fale conosco pelo WhatsApp.
        </p>
      )}
    </form>
  );
}
