import { ProductCard } from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductGridProps {
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
}

export const ProductGrid = ({ searchTerm, categoryFilter, sortBy }: ProductGridProps) => {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          description={product.description || ""}
          image={product.image_url || ""}
          video={product.video_url}
          categories={product.categories || []}
          strain={product.strain}
          potency={product.potency}
        />
      ))}
    </div>
  );
};