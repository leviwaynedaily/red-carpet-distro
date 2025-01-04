import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  video?: string;
  categories: string[];
  strain?: string;
  potency?: string;
}

interface ProductGridProps {
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
  viewMode: 'small' | 'medium' | 'large';
}

export const ProductGrid = ({
  searchTerm,
  categoryFilter,
  sortBy,
  viewMode,
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        // Add a sample video URL to the first product for testing
        const productsWithVideo = data.map((product, index) => {
          if (index === 0) {
            return {
              ...product,
              video: "https://static.videezy.com/system/resources/previews/000/000/168/original/Record.mp4"
            };
          }
          return product;
        });

        setProducts(productsWithVideo);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categories.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const gridClasses = {
    small: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
    medium: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    large: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={gridClasses[viewMode]}>
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};