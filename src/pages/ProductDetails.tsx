import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['products']['Row'];

interface Media {
  webp?: string;
}

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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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

  const validCategories = product.categories?.filter(category => category && category.trim()) || [];
  const hasMultipleMedia = product.image_url && product.video_url;
  const media = product.media as Media;

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
        <div className="relative">
          <Carousel className="w-full max-w-[600px]">
            <CarouselContent>
              {product.image_url ? (
                <CarouselItem>
                  <div className="aspect-square relative">
                    <picture>
                      {media?.webp && (
                        <source srcSet={media.webp} type="image/webp" />
                      )}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </picture>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4"
                      onClick={() => handleDownload(product.image_url!, `${product.name}-image.${product.image_url!.split('.').pop()}`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                </CarouselItem>
              ) : (
                <CarouselItem>
                  <div className="aspect-square relative rounded-lg bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Image coming soon</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )}
              {product.video_url && (
                <CarouselItem>
                  <div className="aspect-square relative">
                    <video
                      src={product.video_url}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4"
                      onClick={() => handleDownload(product.video_url!, `${product.name}-video.${product.video_url!.split('.').pop()}`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Video
                    </Button>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {hasMultipleMedia && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {validCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {validCategories.map((category: string) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}
          </div>

          {(product.strain || product.stock || product.regular_price || product.shipping_price) && (
            <div className="space-y-2 border-t pt-4">
              {product.strain && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Strain</span>
                  <span className="font-medium">{product.strain}</span>
                </div>
              )}
              {product.stock !== null && product.stock !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
              )}
              {product.regular_price !== null && product.regular_price !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">${product.regular_price}</span>
                </div>
              )}
              {product.shipping_price !== null && product.shipping_price !== undefined && product.shipping_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${product.shipping_price}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;