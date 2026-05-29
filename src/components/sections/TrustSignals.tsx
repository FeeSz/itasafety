import { ShieldCheck, Truck, Award, Headphones } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "CA Certificado",
    text: "Todos os produtos possuem Certificado de Aprovação do MTE.",
  },
  {
    icon: Truck,
    title: "Entrega Nacional",
    text: "Enviamos para todo o Brasil com prazo garantido.",
  },
  {
    icon: Award,
    title: "Marcas Certificadas",
    text: "Trabalhamos apenas com fabricantes homologados.",
  },
  {
    icon: Headphones,
    title: "Suporte Especializado",
    text: "Equipe técnica para auxiliar na escolha do EPI correto.",
  },
];

export default function TrustSignals() {
  return (
    <section className="bg-surface-raised py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, idx) => {
          const Icon = it.icon;
          return (
            <div
              key={it.title}
              className="text-center md:border-l md:border-hairline md:first:border-l-0 md:px-4"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Icon className="mx-auto size-12 text-brand-blue" strokeWidth={1.6} />
              <h3 className="mt-3 text-base font-bold text-ink">{it.title}</h3>
              <p className="mx-auto mt-2 max-w-[240px] text-sm text-ink-soft">
                {it.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
