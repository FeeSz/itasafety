import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuoteCart } from "@/components/quote/QuoteCartContext";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/carrinho")({
  head: () =>
    pageMeta({
      title: "Lista de Cotação — ItaSafety",
      description:
        "Revise os EPIs selecionados e envie sua solicitação de cotação à equipe comercial da ItaSafety.",
      path: "/carrinho",
    }),
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { items, remove, setQty, clear } = useQuoteCart();
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    obs: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Adicione produtos antes de enviar.");
      return;
    }
    toast.success("Cotação enviada! Em breve nossa equipe entra em contato.");
    clear();
    setForm({ nome: "", empresa: "", email: "", telefone: "", obs: "" });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Lista de Cotação</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Confirme os itens e envie sua solicitação. Responderemos em até 24h.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Items */}
        <div className="rounded-xl border border-hairline bg-white">
          {items.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingCart className="mx-auto size-12 text-ink-soft" />
              <p className="mt-4 font-semibold text-ink">Nenhum item na lista</p>
              <Link
                to="/"
                className="mt-4 inline-block text-sm font-semibold text-brand-blue"
              >
                Continuar comprando →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {items.map((i) => (
                <li key={i.sku} className="flex gap-4 p-4">
                  <img
                    src={i.image}
                    alt=""
                    className="size-20 shrink-0 rounded-md bg-surface-sunken object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-blue-light">
                      {i.category}
                    </p>
                    <p className="font-semibold text-ink">{i.name}</p>
                    <p className="mt-1 font-mono text-xs text-ink-soft">Ref: {i.sku}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        aria-label={`Quantidade de ${i.name}`}
                        onChange={(e) => setQty(i.sku, parseInt(e.target.value || "1", 10))}
                        className="w-20 rounded-md border border-hairline px-3 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => remove(i.sku)}
                        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-red"
                      >
                        <Trash2 className="size-4" /> Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="h-fit rounded-xl border border-hairline bg-white p-6"
        >
          <h2 className="text-lg font-bold text-ink">Seus dados</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Preencha para receber a cotação personalizada.
          </p>
          <div className="mt-5 space-y-3">
            {[
              { k: "nome", label: "Nome completo", type: "text" },
              { k: "empresa", label: "Empresa", type: "text" },
              { k: "email", label: "E-mail", type: "email" },
              { k: "telefone", label: "Telefone / WhatsApp", type: "tel" },
            ].map((f) => (
              <label key={f.k} className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">
                  {f.label}
                </span>
                <input
                  type={f.type}
                  required
                  value={form[f.k as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">
                Observações
              </span>
              <textarea
                rows={3}
                value={form.obs}
                onChange={(e) => setForm({ ...form, obs: e.target.value })}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 w-full rounded-md bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover"
          >
            Enviar Solicitação ({items.length} {items.length === 1 ? "item" : "itens"})
          </button>
        </form>
      </div>
    </section>
  );
}
