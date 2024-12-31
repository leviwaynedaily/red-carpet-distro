import { ProductCard } from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductGridProps {
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
  viewMode: 'grid' | 'list' | 'compact';
}

export const ProductGrid = ({ searchTerm, categoryFilter, sortBy, viewMode }: ProductGridProps) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      (product.categories &&
        product.categories.some((cat: string) =>
          cat.toLowerCase().includes(categoryFilter.toLowerCase())
        ));
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "potency-asc")
      return (
        parseInt(a.potency?.replace("%", "") || "0") -
        parseInt(b.potency?.replace("%", "") || "0")
      );
    if (sortBy === "potency-desc")
      return (
        parseInt(b.potency?.replace("%", "") || "0") -
        parseInt(a.potency?.replace("%", "") || "0")
      );
    return 0;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  const gridClasses = {
    grid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3",
    list: "grid grid-cols-1 gap-4",
    compact: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"
  };

  return (
    <div className={gridClasses[viewMode]}>
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          description={product.description || ""}
          image={product.image_url || ""}
          video={product.video_url}
          categories={product.categories || []}
          strain={product.strain}
          potency={product.potency}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};