import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
            onClick={() => window.open(product.image_url, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Image
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.categories?.map((category: string) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {(product.strain || product.potency) && (
            <div className="space-y-2 border-t pt-4">
              {product.strain && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Strain</span>
                  <span className="font-medium">{product.strain}</span>
                </div>
              )}
              {product.potency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">THC Content</span>
                  <span className="font-medium">{product.potency}</span>
                </div>
              )}
            </div>
          )}

          {product.video_url && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Product Video</h3>
              <video
                src={product.video_url}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;