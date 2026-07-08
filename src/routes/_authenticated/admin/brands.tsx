import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
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

type Row = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  sort_order: number;
  active: boolean;
};

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const Route = createFileRoute("/_authenticated/admin/brands")({
  component: BrandsAdmin,
});

function BrandsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as Row[];
    },
  });

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleActive = useMutation({
    mutationFn: async (r: Row) => {
      const { error } = await supabase.from("brands").update({ active: !r.active }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-brands"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marca removida");
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Marcas</h2>
          <p className="text-sm text-ink-muted">Fabricantes e marcas representadas.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover"
        >
          <Plus className="size-4" /> Nova marca
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-ink-muted">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-surface-sunken text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Logo</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Ordem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0 hover:bg-surface-sunken/40"
                >
                  <td className="px-4 py-3">
                    {r.logo_url ? (
                      <img src={r.logo_url} alt={r.name} className="h-8 w-auto object-contain" />
                    ) : (
                      <span className="text-xs text-ink-soft">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{r.slug}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive.mutate(r)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-surface-sunken text-ink-soft"
                      }`}
                    >
                      {r.active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {r.active ? "Ativa" : "Inativa"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(r)}
                      className="mr-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-soft">
                    Nenhuma marca cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <BrandDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        row={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => qc.invalidateQueries({ queryKey: ["admin-brands"] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover marca?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é permanente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteId && remove.mutate(deleteId, { onSettled: () => setDeleteId(null) })
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrandDialog({
  open,
  row,
  onClose,
  onSaved,
}: {
  open: boolean;
  row: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!row;
  const [name, setName] = useState(row?.name ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(row?.logo_url ?? "");
  const [sortOrder, setSortOrder] = useState(row?.sort_order ?? 0);
  const [active, setActive] = useState(row?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const save = async () => {
    if (!name.trim()) return toast.error("Nome obrigatório.");
    const finalSlug = slug.trim() || slugify(name);
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl.trim() || null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("logos")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(data.path);
        finalLogoUrl = publicUrlData.publicUrl;
      }

      const payload = {
        name: name.trim(),
        slug: finalSlug,
        logo_url: finalLogoUrl,
        sort_order: Number(sortOrder) || 0,
        active,
      };
      const { error } = isEdit
        ? await supabase.from("brands").update(payload).eq("id", row!.id)
        : await supabase.from("brands").insert(payload);
      if (error) throw error;
      toast.success(isEdit ? "Marca atualizada" : "Marca criada");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar marca" : "Nova marca"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormRow label="Nome">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEdit) setSlug(slugify(e.target.value));
              }}
              className="input"
              placeholder="Ex: 3M"
            />
          </FormRow>
          <FormRow label="Slug (URL)">
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="input font-mono"
            />
          </FormRow>
          <FormRow label="Logo (Upload ou URL)">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  } else {
                    setFile(null);
                  }
                }}
                className="input file:mr-4 file:rounded-md file:border-0 file:bg-brand-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-blue-hover"
              />
              <span className="text-xs text-ink-muted text-center uppercase">OU</span>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="input"
                placeholder="URL da imagem (ex: https://...)"
                disabled={!!file}
              />
            </div>
          </FormRow>
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Ordem">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="input"
              />
            </FormRow>
            <FormRow label="Status">
              <label className="flex h-10 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="size-4 accent-brand-blue"
                />
                <span className="text-sm">{active ? "Ativa" : "Inativa"}</span>
              </label>
            </FormRow>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="rounded-md border border-hairline px-4 py-2 text-sm hover:bg-surface-sunken"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
