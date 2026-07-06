import { defineMcp } from "@lovable.dev/mcp-js";
import listCategoriesTool from "./tools/list-categories";
import listFeaturedProductsTool from "./tools/list-featured-products";
import searchProductsTool from "./tools/search-products";
import getCompanyInfoTool from "./tools/get-company-info";

export default defineMcp({
  name: "itasafety-mcp",
  title: "ItaSafety",
  version: "0.1.0",
  instructions:
    "Tools for exploring ItaSafety's public catalog of safety equipment (EPI). Use `list_categories` to see product categories, `list_featured_products` for the featured catalog, `search_products` to look up items by keyword, and `get_company_info` for company/contact details.",
  tools: [listCategoriesTool, listFeaturedProductsTool, searchProductsTool, getCompanyInfoTool],
});
