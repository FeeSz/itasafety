import { createContext } from "react";
import type { Product } from "@/lib/products";

export type QuoteItem = {
  sku: string;
  name: string;
  image: string;
  category: string;
  ca_number?: string;
  qty: number;
};

export type QuoteCartContextValue = {
  items: QuoteItem[];
  count: number;
  add: (product: Product | QuoteItem, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  syncing: boolean;
};

export const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);
