import emailjs from "@emailjs/browser";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID_CONTATO,
} from "@/lib/emailjs-config";
import { IS_VISUAL_MODE } from "@/lib/visual-mode";

const contactSubjects = ["Dúvidas", "Sugestões", "Contato", "Elogios"] as const;

const contactSchema = z.object({
  subject: z.enum(contactSubjects, { message: "Selecione um assunto" }),
  name: z.string().trim().min(2, "Informe seu nome").max(80, "Use até 80 caracteres"),
  phone: z
    .string()
    .trim()
    .max(20, "Use até 20 caracteres")
    .refine((value) => value === "" || value.replace(/\D/g, "").length >= 8, {
      message: "Informe um telefone válido",
    }),
  email: z.string().trim().email("Informe um e-mail válido").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Escreva pelo menos 10 caracteres")
    .max(2000, "Use até 2.000 caracteres"),
});

type ContactField = keyof z.infer<typeof contactSchema>;
type ContactErrors = Partial<Record<ContactField, string>>;
type SubmitStatus = "idle" | "loading" | "success" | "error";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="text-caption text-danger" role="alert">
      {message}
    </p>
  );
}

export default function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(form)));

    if (!parsed.success) {
      const nextErrors: ContactErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as ContactField;
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      setStatus("idle");

      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }

    setErrors({});

    if (IS_VISUAL_MODE) {
      setStatus("success");
      return;
    }

    if (!EMAILJS_TEMPLATE_ID_CONTATO) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_CONTATO,
        {
          subject: parsed.data.subject,
          contact_name: parsed.data.name,
          contact_email: parsed.data.email,
          contact_phone: parsed.data.phone || "Não informado",
          message: parsed.data.message,
          reply_to: parsed.data.email,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-t border-border pt-8" role="status" aria-live="polite">
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-success">
          Mensagem enviada
        </p>
        <h2 className="mt-3 text-title-lg font-semibold tracking-tight text-foreground">
          Obrigado pelo contato.
        </h2>
        <p className="mt-3 max-w-md text-body leading-relaxed text-foreground-muted">
          Sua mensagem chegou à equipe ItaSafety. Responderemos pelo e-mail ou telefone informado.
        </p>
        <Button className="mt-7" variant="outline" onClick={() => setStatus("idle")}>
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      aria-label="Formulário de contato"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="contact-subject">Assunto</Label>
        <div className="relative">
          <select
            id="contact-subject"
            name="subject"
            defaultValue=""
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            className="focus-ring motion-surface h-11 w-full appearance-none rounded-md border border-input bg-surface px-3 pr-10 text-body text-foreground focus-visible:border-primary aria-invalid:border-danger aria-invalid:bg-danger-muted"
          >
            <option value="" disabled>
              Selecione o motivo do contato
            </option>
            {contactSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <FieldError id="contact-subject-error" message={errors.subject} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Nome</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Como devemos chamar você?"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="contact-phone">Telefone</Label>
            <span className="text-caption text-foreground-subtle">Opcional</span>
          </div>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 00000-0000"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          />
          <FieldError id="contact-phone-error" message={errors.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">E-mail</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@empresa.com.br"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        <FieldError id="contact-email-error" message={errors.email} />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="contact-message">Mensagem</Label>
          <span className="text-caption text-foreground-subtle">Até 2.000 caracteres</span>
        </div>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={2000}
          placeholder="Conte, de forma breve, como podemos ajudar."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="min-h-36 resize-y"
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      {status === "error" && (
        <div className="border-l-2 border-danger pl-4 text-body-sm text-foreground" role="alert">
          Não foi possível enviar agora. Tente novamente ou escreva para{" "}
          <a className="font-semibold text-primary underline underline-offset-4" href="mailto:contato@itasafety.com.br">
            contato@itasafety.com.br
          </a>
          .
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-caption leading-relaxed text-foreground-muted">
          Ao enviar, você concorda com nossa{" "}
          <Link to="/privacidade" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
            Política de Privacidade
          </Link>
          .
        </p>
        <Button
          type="submit"
          size="lg"
          isLoading={status === "loading"}
          className="w-full text-white sm:w-auto"
        >
          {status === "loading" ? "Enviando" : "Enviar mensagem"}
        </Button>
      </div>
    </form>
  );
}
