/**
 * QuoteCartContext — Carrinho de Cotação B2B
 *
 * - Usuário não autenticado: persiste em localStorage (comportamento anterior)
 * - Usuário autenticado: persiste em Supabase (carrinho_cotacao) + sincroniza localStorage
 * - Ao autenticar: migra itens do localStorage para o Supabase automaticamente
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/lib/products";

export type QuoteItem = {
  sku: string;
  name: string;
  image: string;
  category: string;
  ca_number?: string;
  qty: number;
};

type Ctx = {
  items: QuoteItem[];
  count: number;
  add: (p: Product | QuoteItem, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  syncing: boolean;
};

const QuoteCartContext = createContext<Ctx | null>(null);
const STORAGE = "itasafety:quote";

// ── helpers ─────────────────────────────────────────────────────────────────

function readLocal(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as QuoteItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: QuoteItem[]) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(items));
  } catch {/* ignore */}
}

function clearLocal() {
  try {
    localStorage.removeItem(STORAGE);
  } catch {/* ignore */}
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const prevUserId = useRef<string | null>(null);

  // ── Load cart ──────────────────────────────────────────────────────────────

  async function loadFromSupabase(userId: string): Promise<QuoteItem[]> {
    const { data, error } = await (supabase as any)
      .from("carrinho_cotacao")
      .select("sku, nome, image_url, categoria, ca_number, quantidade")
      .eq("user_id", userId);

    if (error || !data) return [];
    return data.map((row: any) => ({
      sku:       row.sku,
      name:      row.nome,
      image:     row.image_url ?? "",
      category:  row.categoria ?? "",
      ca_number: row.ca_number ?? "",
      qty:       row.quantidade,
    }));
  }

  // ── Upsert single item in Supabase ────────────────────────────────────────

  async function upsertSupabase(userId: string, item: QuoteItem) {
    await (supabase as any).from("carrinho_cotacao").upsert(
      {
        user_id:   userId,
        sku:       item.sku,
        nome:      item.name,
        image_url: item.image,
        categoria: item.category,
        ca_number: item.ca_number ?? null,
        quantidade: item.qty,
      },
      { onConflict: "user_id,sku" },
    );
  }

  // ── Delete single item in Supabase ────────────────────────────────────────

  async function deleteSupabase(userId: string, sku: string) {
    await (supabase as any)
      .from("carrinho_cotacao")
      .delete()
      .eq("user_id", userId)
      .eq("sku", sku);
  }

  // ── Clear all in Supabase ─────────────────────────────────────────────────

  async function clearSupabase(userId: string) {
    await (supabase as any)
      .from("carrinho_cotacao")
      .delete()
      .eq("user_id", userId);
  }

  // ── On auth change ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      // Logged out — load from localStorage
      setItems(readLocal());
      prevUserId.current = null;
      return;
    }

    if (prevUserId.current === user.id) return;
    prevUserId.current = user.id;

    // Just logged in: migrate localStorage items → Supabase, then load all
    setSyncing(true);
    const localItems = readLocal();

    loadFromSupabase(user.id).then(async (dbItems) => {
      const merged = [...dbItems];

      // Merge local items that aren't in DB yet
      for (const local of localItems) {
        const exists = merged.find((d) => d.sku === local.sku);
        if (!exists) {
          merged.push(local);
          await upsertSupabase(user.id, local);
        } else {
          // Keep higher quantity
          if (local.qty > exists.qty) {
            exists.qty = local.qty;
            await upsertSupabase(user.id, exists);
          }
        }
      }

      clearLocal();
      setItems(merged);
      setSyncing(false);
    });
  }, [user?.id]);

  // ── Persist to localStorage when not authenticated ────────────────────────

  useEffect(() => {
    if (!user) writeLocal(items);
  }, [items, user]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const add = useCallback(
    (p: Product | QuoteItem, qty = 1) => {
      setItems((prev) => {
        const sku = p.sku;
        const existing = prev.find((i) => i.sku === sku);
        let next: QuoteItem[];

        if (existing) {
          next = prev.map((i) =>
            i.sku === sku ? { ...i, qty: i.qty + qty } : i,
          );
        } else {
          const newItem: QuoteItem = {
            sku,
            name:      "name"     in p ? p.name     : (p as QuoteItem).name,
            image:     "image"    in p ? p.image     : (p as QuoteItem).image,
            category:  "category" in p ? p.category  : (p as QuoteItem).category,
            ca_number: "ca"       in p ? String((p as Product).ca) : (p as QuoteItem).ca_number,
            qty,
          };
          next = [...prev, newItem];
        }

        // Sync to Supabase if authenticated
        if (user) {
          const updated = next.find((i) => i.sku === sku)!;
          upsertSupabase(user.id, updated);
        }

        return next;
      });
    },
    [user],
  );

  const remove = useCallback(
    (sku: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.sku !== sku);
        if (user) deleteSupabase(user.id, sku);
        return next;
      });
    },
    [user],
  );

  const setQty = useCallback(
    (sku: string, qty: number) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.sku === sku ? { ...i, qty: Math.max(1, Math.min(qty, 9999)) } : i,
        );
        if (user) {
          const updated = next.find((i) => i.sku === sku);
          if (updated) upsertSupabase(user.id, updated);
        }
        return next;
      });
    },
    [user],
  );

  const clear = useCallback(() => {
    setItems([]);
    if (user) clearSupabase(user.id);
    else clearLocal();
  }, [user]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((acc, i) => acc + i.qty, 0),
      add,
      remove,
      setQty,
      clear,
      open,
      setOpen,
      syncing,
    }),
    [items, add, remove, setQty, clear, open, syncing],
  );

  return (
    <QuoteCartContext.Provider value={value}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used within QuoteCartProvider");
  return ctx;
}
