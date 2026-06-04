const MESSAGES = [
  { icon: "🛡️", text: "BEM-VINDO À ITASAFETY • EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL" },
  { icon: "📦", text: "ENTREGAMOS PARA TODO O BRASIL • QUALIDADE E SEGURANÇA CERTIFICADAS" },
  { icon: "📞", text: "Fale conosco: contato@itasafety.com.br" },
  { icon: "✅", text: "Produtos com CA — Certificado de Aprovação MTE" },
];

export default function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div
      className="overflow-hidden border-b border-hairline bg-surface-sunken text-ink-muted"
      role="region"
      aria-label="Avisos"
    >
      <div className="relative mx-auto flex h-9 items-center">
        <div className="animate-marquee flex shrink-0 whitespace-nowrap">
          {items.map((m, i) => (
            <span
              key={i}
              className="mx-8 inline-flex items-center gap-2 text-[11px] font-medium tracking-wide"
            >
              <span className="text-brand-blue">{m.icon}</span>
              <span>{m.text}</span>
              <span className="ml-8 text-hairline">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
