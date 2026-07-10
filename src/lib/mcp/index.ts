import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCategoriesTool from "./tools/list-categories";
import listFeaturedProductsTool from "./tools/list-featured-products";
import searchProductsTool from "./tools/search-products";
import getCompanyInfoTool from "./tools/get-company-info";

// The OAuth issuer MUST be the direct Supabase host. On publish, SUPABASE_URL is
// rewritten to the `.lovable.cloud` proxy, which mcp-js rejects (RFC 8414 issuer
// mismatch). VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "itasafety-mcp",
  title: "ItaSafety",
  version: "0.1.0",
  instructions:
    "Tools for exploring ItaSafety's public catalog of safety equipment (EPI). Use `list_categories` to see product categories, `list_featured_products` for the featured catalog, `search_products` to look up items by keyword, and `get_company_info` for company/contact details.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCategoriesTool, listFeaturedProductsTool, searchProductsTool, getCompanyInfoTool],
});
