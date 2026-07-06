import { defineTool } from "@lovable.dev/mcp-js";
import { CATEGORIES } from "@/lib/categories";

export default defineTool({
  name: "list_categories",
  title: "List product categories",
  description:
    "List all ItaSafety product categories (safety equipment / EPI) with slugs and subcategories.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const data = CATEGORIES.map((c) => ({
      slug: c.slug,
      title: c.title,
      subcategories: c.subcategories ?? [],
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { categories: data },
    };
  },
});
