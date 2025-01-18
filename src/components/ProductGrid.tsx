import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'product_categories'],
    queryFn: async () => {
      console.log('ProductGrid: Fetching products with categories');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            category:categories(name)
          )
        `);
      
      if (productsError) {
        console.error('ProductGrid: Error fetching products:', productsError);
        throw productsError;
      }
      
      // Transform the data to match the expected format
      const transformedProducts = productsData.map(product => ({
        ...product,
        categories: product.product_categories
          ?.map(pc => pc.category?.name)
          .filter(Boolean) || []
      }));
      
      console.log('ProductGrid: Fetched and transformed products:', transformedProducts);
      return transformedProducts;
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
    
    // Modified category filter logic to show products without categories when "all" is selected
    const matchesCategory = categoryFilter === 'all' || 
      (product.categories && product.categories.includes(categoryFilter));

    console.log('ProductGrid: Filtering product:', {
      productName: product.name,
      productCategories: product.categories,
      categoryFilter,
      matchesSearch,
      matchesCategory
    });
    
    return matchesSearch && (categoryFilter === 'all' || matchesCategory);
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

  console.log('ProductGrid: Rendering filtered products:', {
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
    sortedCount: sortedProducts.length
  });

  return (
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
  );
};