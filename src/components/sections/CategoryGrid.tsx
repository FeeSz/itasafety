import CategoryCard from "@/components/catalog/CategoryCard";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryGrid({ limit }: { limit?: number }) {
  const categories = typeof limit === "number" ? CATEGORIES.slice(0, limit) : CATEGORIES;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </div>
  );
}
