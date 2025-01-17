import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  video?: string;
  categories: string[];
  strain?: string;
  stock?: number;
  regular_price?: number;
  shipping_price?: number;
  created_at: string;
  updated_at: string;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const refreshThreshold = 100;
  const refreshIndicatorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      console.log('Products fetched successfully:', data?.length);
      const mappedProducts = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image_url,
        video: item.video_url,
        categories: item.categories || [],
        strain: item.strain,
        stock: item.stock,
        regular_price: item.regular_price,
        shipping_price: item.shipping_price,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleTouchStart = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      // Only enable pull-to-refresh when at the top of the container
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        if (refreshIndicatorRef.current) {
          refreshIndicatorRef.current.style.transition = 'none';
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container || startY.current === 0) return;

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      // Only allow pull-to-refresh when scrolled to top and pulling down
      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        if (refreshIndicatorRef.current) {
          const pullDistance = Math.min(diff * 0.5, refreshThreshold);
          refreshIndicatorRef.current.style.transform = `translateY(${pullDistance}px)`;
        }
      }
    };

    const handleTouchEnd = async () => {
      const container = containerRef.current;
      if (!container || startY.current === 0 || currentY.current === 0) return;

      const diff = currentY.current - startY.current;
      
      if (refreshIndicatorRef.current) {
        refreshIndicatorRef.current.style.transition = 'transform 0.3s ease-out';
        refreshIndicatorRef.current.style.transform = 'translateY(0)';
      }

      if (diff > refreshThreshold && container.scrollTop === 0) {
        console.log('Pull-to-refresh triggered');
        setIsRefreshing(true);
        await fetchProducts();
      }

      startY.current = 0;
      currentY.current = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.categories.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    console.log('Sorting by:', sortBy);
    
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

  const gridClasses = {
    small: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
    medium: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    large: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative h-full overflow-y-auto -mx-4 px-4"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div 
        ref={refreshIndicatorRef} 
        className="absolute left-0 right-0 -top-16 flex items-center justify-center"
      >
        {isRefreshing && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      <div className={gridClasses[viewMode]}>
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};