import { Link } from "@tanstack/react-router";
import { Shield, Truck } from "lucide-react";

export default function IntermediateBanners() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-active p-8 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-strong">
          <Shield className="absolute -right-4 -top-4 size-40 opacity-10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12" />
          <div className="relative">
            <Shield className="size-10 text-white" />
            <h3 className="mt-4 text-2xl font-extrabold">Produtos Certificados</h3>
            <p className="mt-2 max-w-sm text-sm text-white/85">
              Todos com Certificado de Aprovação (CA) do MTE.
            </p>
            <Link
              to="/departamento/$slug"
              params={{ slug: "calcados" }}
              className="mt-5 inline-block rounded-md border-2 border-white px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-brand-blue"
            >
              Ver Produtos com CA
            </Link>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-header-dark p-8 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-strong">
          <Truck className="absolute -right-4 -top-4 size-40 text-brand-blue-light opacity-15 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12" />
          <div className="relative">
            <Truck className="size-10 text-brand-blue-light" />
            <h3 className="mt-4 text-2xl font-extrabold">Entrega para Todo o Brasil</h3>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Envio rápido com rastreamento para todo o território nacional.
            </p>
            <Link
              to="/contato"
              className="mt-5 inline-block rounded-md bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover"
            >
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
