import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface ProductGridProps {
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
}

export const ProductGrid = ({
  searchTerm,
  categoryFilter,
  sortBy,
}: ProductGridProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-500">Error loading products. Please try again later.</p>
      </div>
    );
  }

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || (product.categories && product.categories.includes(categoryFilter));
    return matchesSearch && matchesCategory;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'strain-asc':
        return (a.strain || '').localeCompare(b.strain || '');
      case 'strain-desc':
        return (b.strain || '').localeCompare(a.strain || '');
      case 'price-asc':
        return (a.regular_price || 0) - (b.regular_price || 0);
      case 'price-desc':
        return (b.regular_price || 0) - (a.regular_price || 0);
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          image={product.image_url || ''}
          video={product.video_url || ''}
          viewMode="small"
        />
      ))}
    </div>
  );
};