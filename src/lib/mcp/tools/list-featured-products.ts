import { defineTool } from "@lovable.dev/mcp-js";
import { FEATURED_PRODUCTS } from "@/lib/products";

export default defineTool({
  name: "list_featured_products",
  title: "List featured products",
  description:
    "List ItaSafety featured safety equipment products, including SKU, name, category, CA certification and description.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const data = FEATURED_PRODUCTS.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      categorySlug: p.categorySlug,
      ca: p.ca,
      description: p.description,
      tags: p.tags ?? [],
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data },
    };
  },
});
