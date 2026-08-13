import { ClipboardCheck, FileCheck2, Layers3, MessagesSquare } from "lucide-react";
import Container from "@/components/ui/Container";

const ITEMS = [
  {
    icon: FileCheck2,
    title: "Conformidade visível",
    text: "Identificação de CA e informações técnicas disponíveis no catálogo.",
  },
  {
    icon: MessagesSquare,
    title: "Atendimento consultivo",
    text: "Um canal comercial preparado para entender o contexto da solicitação.",
  },
  {
    icon: Layers3,
    title: "Portfólio por aplicação",
    text: "Categorias organizadas para reduzir o tempo de busca e comparação.",
  },
  {
    icon: ClipboardCheck,
    title: "Cotação centralizada",
    text: "Uma única lista para reunir produtos e quantidades antes do envio.",
  },
];

export default function TrustSignals() {
  return (
    <section className="border-b border-black/5 bg-white py-8" aria-label="Recursos da experiência">
      <Container>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-3 rounded-2xl px-3 py-4 transition-colors duration-300 hover:bg-[#f5f5f7]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-blue-tint text-brand-blue">
                <Icon className="size-5" strokeWidth={1.7} aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
