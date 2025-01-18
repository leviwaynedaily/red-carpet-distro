import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      console.log('ProductDetails: Fetching product details for ID:', id);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories (
            category:categories(name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error('ProductDetails: Error fetching product:', error);
        throw error;
      }

      // Transform the data to match the expected format
      const transformedProduct = {
        ...data,
        categories: data.product_categories?.map(pc => pc.category?.name).filter(Boolean) || []
      };

      console.log('ProductDetails: Successfully fetched product:', transformedProduct);
      return transformedProduct;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading product</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>
        <div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="space-y-2">
            {product.strain && (
              <p>
                <span className="font-semibold">Strain:</span> {product.strain}
              </p>
            )}
            {product.categories && product.categories.length > 0 && (
              <p>
                <span className="font-semibold">Categories:</span>{" "}
                {product.categories.join(", ")}
              </p>
            )}
            <p>
              <span className="font-semibold">Price:</span> $
              {product.regular_price?.toFixed(2)}
            </p>
            {product.shipping_price !== undefined && (
              <p>
                <span className="font-semibold">Shipping:</span> $
                {product.shipping_price.toFixed(2)}
              </p>
            )}
            <p>
              <span className="font-semibold">Stock:</span> {product.stock}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}