import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log('ProductDetails: Fetching product details for ID:', id);
      
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            category:categories(name)
          )
        `)
        .eq('id', id)
        .single();

      if (productError) {
        console.error('ProductDetails: Error fetching product:', productError);
        throw productError;
      }

      // Transform the data to include categories array
      const transformedProduct = {
        ...productData,
        categories: productData.product_categories
          ?.map(pc => pc.category?.name)
          .filter(Boolean) || []
      };

      console.log('ProductDetails: Successfully fetched product:', transformedProduct);
      return transformedProduct;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    console.error('ProductDetails: Error rendering product:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Error loading product details. Please try again later.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCard
        {...product}
        image={product.image_url || ''}
        video={product.video_url || ''}
        media={product.media}
        viewMode="large"
      />
    </div>
  );
}