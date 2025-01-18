import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ProductGridProps {
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
}

interface Media {
  webp?: string;
}

export const ProductGrid = ({
  searchTerm,
  categoryFilter,
  sortBy,
}: ProductGridProps) => {
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      console.log('ProductGrid: Fetching products');
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('ProductGrid: Error fetching products:', error);
        throw error;
      }
      
      console.log('ProductGrid: Fetched products:', data);
      return data;
    }
  });

  const handleRefresh = async () => {
    console.log('ProductGrid: Manually refreshing products');
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    console.error('ProductGrid: Error rendering products:', error);
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-500">Error loading products. Please try again later.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log('ProductGrid: No products found');
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || 
      (product.categories && product.categories.includes(categoryFilter));
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

  console.log('ProductGrid: Rendering filtered products:', sortedProducts.length);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            image={product.image_url || ''}
            video={product.video_url || ''}
            media={product.media as Media}
            viewMode="small"
          />
        ))}
      </div>
    </div>
  );
};