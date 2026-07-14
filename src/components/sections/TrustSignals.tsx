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
              className="group text-center md:border-l md:border-hairline md:first:border-l-0 md:px-4 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Icon 
                className="mx-auto size-12 text-brand-blue transition-all duration-300 group-hover:scale-110 group-hover:text-brand-blue-hover drop-shadow-sm group-hover:drop-shadow-md" 
                strokeWidth={1.6} 
              />
              <h3 className="mt-3 text-base font-bold text-ink transition-colors group-hover:text-brand-blue">{it.title}</h3>
              <p className="mx-auto mt-2 max-w-[240px] text-sm text-ink-soft">{it.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
