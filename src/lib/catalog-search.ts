import type { Product } from "@/lib/products";

export function normalizeCatalogSearch(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

export function productMatchesCatalogQuery(product: Product, query: string) {
  const term = normalizeCatalogSearch(query);
  if (!term) return true;

  const searchableContent = [
    product.name,
    product.sku,
    product.category,
    product.ca,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeCatalogSearch(searchableContent).includes(term);
}
