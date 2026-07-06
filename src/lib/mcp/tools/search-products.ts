import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FEATURED_PRODUCTS } from "@/lib/products";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search ItaSafety products by keyword (matches name, SKU, category or description) with an optional category slug filter.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search keyword"),
    categorySlug: z.string().trim().optional().describe("Optional category slug to filter by"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, categorySlug }) => {
    const q = query.toLowerCase();
    const results = FEATURED_PRODUCTS.filter((p) => {
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }).map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      categorySlug: p.categorySlug,
      ca: p.ca,
      description: p.description,
    }));

    return {
      content: [
        {
          type: "text",
          text: results.length
            ? JSON.stringify(results, null, 2)
            : `No products matched "${query}".`,
        },
      ],
      structuredContent: { results, count: results.length },
    };
  },
});
