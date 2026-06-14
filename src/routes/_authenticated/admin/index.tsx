import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import {
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Loader2,
  EyeOff,
  Eye,
  LayoutDashboard,
  Package,
  ShieldCheck,
  AlertTriangle,
  ImageOff,
  FileCheck,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  short_description: string;
  long_description: string | null;
  ca_number: string | null;
  norms: string[];
  image_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

type AuthAttempt = {
  id: string;
  email: string;
  attempt_type: string;
  success: boolean;
  created_at: string;
  ip_address?: string;
};

type Tab = "dashboard" | "products";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
});

const emptyForm: Omit<ProductRow, "id"> = {
  sku: "",
  slug: "",
  name: "",
  category: CATEGORIES[0]?.slug ?? "",
  subcategory: "",
  brand: "",
  short_description: "",
  long_description: "",
  ca_number: "",
  norms: [],
  image_url: "",
  featured: false,
  published: true,
  sort_order: 0,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Tab bar */}
      <div className="mb-8 flex gap-1 rounded-xl border border-hairline bg-white p-1 shadow-card w-fit">
        <TabBtn
          active={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
          icon={<LayoutDashboard className="size-4" />}
          label="Visão Geral"
        />
        <TabBtn
          active={tab === "products"}
          onClick={() => setTab("products")}
          icon={<Package className="size-4" />}
          label="Produtos"
        />
      </div>

      {tab === "dashboard" ? <DashboardTab /> : <ProductsTab />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-brand-blue text-white shadow-sm"
          : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD TAB
───────────────────────────────────────────── */
function DashboardTab() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const { data: attempts, isLoading: loadingAttempts } = useQuery({
    queryKey: ["auth-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as AuthAttempt[];
    },
    refetchInterval: 30_000, // atualiza a cada 30s
  });

  const stats = useMemo(() => {
    if (!products) return null;
    const total = products.length;
    const featured = products.filter((p) => p.featured).length;
    const published = products.filter((p) => p.published).length;
    const drafts = total - published;
    const noCA = products.filter((p) => !p.ca_number).length;
    const noImage = products.filter((p) => !p.image_url).length;

    // Distribuição por categoria
    const byCat = CATEGORIES.map((cat) => ({
      slug: cat.slug,
      title: cat.title,
      count: products.filter((p) => p.category === cat.slug).length,
    })).filter((c) => c.count > 0);

    return { total, featured, published, drafts, noCA, noImage, byCat };
  }, [products]);

  const isLoading = loadingProducts || loadingAttempts;

  return (
    <div className="space-y-8">
      {/* Métricas principais */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
          Métricas do catálogo
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-ink-soft" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Total de EPIs"
              value={stats?.total ?? 0}
              icon={<Package className="size-5 text-brand-blue" />}
              color="blue"
            />
            <MetricCard
              label="Em destaque"
              value={stats?.featured ?? 0}
              icon={<Star className="size-5 text-amber-500" />}
              color="amber"
            />
            <MetricCard
              label="Publicados"
              value={stats?.published ?? 0}
              icon={<Eye className="size-5 text-emerald-500" />}
              color="green"
            />
            <MetricCard
              label="Rascunhos"
              value={stats?.drafts ?? 0}
              icon={<EyeOff className="size-5 text-ink-soft" />}
              color="gray"
            />
            <MetricCard
              label="Sem CA"
              value={stats?.noCA ?? 0}
              icon={<FileCheck className="size-5 text-orange-500" />}
              color="orange"
              alert={stats?.noCA ? stats.noCA > 0 : false}
            />
            <MetricCard
              label="Sem foto"
              value={stats?.noImage ?? 0}
              icon={<ImageOff className="size-5 text-red-500" />}
              color="red"
              alert={stats?.noImage ? stats.noImage > 0 : false}
            />
          </div>
        )}
      </section>

      {/* Distribuição por categoria */}
      {stats && stats.byCat.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
            Distribuição por categoria
          </h2>
          <div className="overflow-hidden rounded-xl border border-hairline bg-white p-6 shadow-card">
            <div className="space-y-4">
              {stats.byCat
                .sort((a, b) => b.count - a.count)
                .map((cat) => (
                  <div key={cat.slug}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{cat.title}</span>
                      <span className="text-xs font-semibold text-ink-muted">
                        {cat.count} produto{cat.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className="h-full rounded-full bg-brand-blue transition-all duration-700"
                        style={{
                          width: `${Math.round((cat.count / (stats.total || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Auditoria de segurança */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand-blue" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Auditoria de acesso (últimas 20 tentativas)
          </h2>
          {loadingAttempts && (
            <Loader2 className="size-3.5 animate-spin text-ink-soft" />
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
          {!loadingAttempts && (!attempts || attempts.length === 0) ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-ink-soft">
              <TrendingUp className="size-8 opacity-30" />
              <p className="text-sm">Nenhum registro de acesso encontrado.</p>
              <p className="text-xs">
                Verifique se a tabela{" "}
                <code className="rounded bg-surface-sunken px-1">
                  auth_attempts
                </code>{" "}
                existe no Supabase.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-hairline bg-surface-sunken text-left text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {loadingAttempts &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-surface-sunken" />
                      </td>
                    </tr>
                  ))}
                {attempts?.map((a) => (
                  <tr
                    key={a.id}
                    className={`transition-colors ${
                      a.success ? "hover:bg-emerald-50/30" : "hover:bg-red-50/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          a.success
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {a.success ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {a.success ? "Sucesso" : "Falha"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {a.email}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-muted">
                      {a.attempt_type === "login"
                        ? "Login"
                        : a.attempt_type === "signup"
                          ? "Cadastro"
                          : "Recuperação"}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {new Date(a.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  alert = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green" | "gray" | "orange" | "red";
  alert?: boolean;
}) {
  const bg: Record<typeof color, string> = {
    blue: "bg-blue-50",
    amber: "bg-amber-50",
    green: "bg-emerald-50",
    gray: "bg-slate-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-hairline bg-white p-5 shadow-card transition-shadow hover:shadow-md`}
    >
      {alert && value > 0 && (
        <span className="absolute right-3 top-3">
          <AlertTriangle className="size-3.5 text-amber-500" />
        </span>
      )}
      <div
        className={`mb-3 flex size-10 items-center justify-center rounded-lg ${bg[color]}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCTS TAB (mantém toda a lógica existente)
───────────────────────────────────────────── */
function ProductsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.ca_number ?? "").toLowerCase().includes(q),
    );
  }, [products, search]);

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto excluído");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublishedMut = useMutation({
    mutationFn: async (p: ProductRow) => {
      const { error } = await supabase
        .from("products")
        .update({ published: !p.published })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeaturedMut = useMutation({
    mutationFn: async (p: ProductRow) => {
      const { error } = await supabase
        .from("products")
        .update({ featured: !p.featured })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Produtos</h2>
          <p className="text-sm text-ink-muted">
            {products?.length ?? 0} cadastrados
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-hover"
        >
          <Plus className="size-4" /> Novo produto
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-md border border-hairline bg-white px-3 py-2 focus-within:border-brand-blue">
        <Search className="size-4 text-ink-soft" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, SKU ou CA..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken text-left text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU / CA</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-center">Destaque</th>
              <th className="px-4 py-3 text-center">Publicado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-surface-sunken/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-md border border-hairline bg-white">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="size-full object-contain"
                        />
                      ) : (
                        <div className="size-full bg-surface-sunken" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <p className="truncate text-xs text-ink-soft">
                        {p.short_description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                  <div>{p.sku}</div>
                  {p.ca_number && (
                    <div className="text-brand-blue">CA {p.ca_number}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleFeaturedMut.mutate(p)}
                    title="Alternar destaque"
                  >
                    <Star
                      className={`size-5 ${
                        p.featured
                          ? "fill-brand-blue text-brand-blue"
                          : "text-ink-soft"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => togglePublishedMut.mutate(p)}
                    title="Alternar publicação"
                    className="text-ink-soft hover:text-brand-blue"
                  >
                    {p.published ? (
                      <Eye className="size-5 text-brand-blue" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-brand-blue-tint hover:text-brand-blue"
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(p.id)}
                      className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-red-50 hover:text-brand-red"
                      title="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              className="bg-brand-red text-white hover:bg-brand-red-dark"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductFormDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: ProductRow | null;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Omit<ProductRow, "id">>(emptyForm);
  const [normsInput, setNormsInput] = useState("");

  useEffect(() => {
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm({
        ...rest,
        subcategory: rest.subcategory ?? "",
        brand: rest.brand ?? "",
        long_description: rest.long_description ?? "",
        ca_number: rest.ca_number ?? "",
        image_url: rest.image_url ?? "",
      });
      setNormsInput((rest.norms ?? []).join(", "));
    } else {
      setForm(emptyForm);
      setNormsInput("");
    }
  }, [editing, open]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        sku: form.sku || slugify(form.name).toUpperCase().slice(0, 12),
        subcategory: form.subcategory || null,
        brand: form.brand || null,
        long_description: form.long_description || null,
        ca_number: form.ca_number || null,
        image_url: form.image_url || null,
        norms: normsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Produto atualizado" : "Produto cadastrado");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Os campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome *">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="SKU *">
              <input
                required
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="gerado do nome"
                className={inputCls}
              />
            </Field>
            <Field label="Categoria *">
              <select
                required
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subcategoria">
              <input
                value={form.subcategory ?? ""}
                onChange={(e) => set("subcategory", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Marca">
              <input
                value={form.brand ?? ""}
                onChange={(e) => set("brand", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Número CA">
              <input
                value={form.ca_number ?? ""}
                onChange={(e) => set("ca_number", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Ordem">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="URL da imagem">
            <input
              type="url"
              value={form.image_url ?? ""}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>

          <Field label="Descrição curta *">
            <textarea
              required
              rows={2}
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Descrição completa">
            <textarea
              rows={4}
              value={form.long_description ?? ""}
              onChange={(e) => set("long_description", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Normas (separe por vírgula)">
            <input
              value={normsInput}
              onChange={(e) => setNormsInput(e.target.value)}
              placeholder="NR-06, NR-10"
              className={inputCls}
            />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Produto em destaque
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
              />
              Publicado
            </label>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-surface-sunken"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:opacity-60"
            >
              {saveMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
