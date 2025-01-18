import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Play, Image } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showMedia, setShowMedia] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handleDownload = async (url: string, type: 'image' | 'video') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${product?.name || 'download'}.${type === 'image' ? 'png' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const toggleMediaType = () => {
    setShowVideo(!showVideo);
    setIsPlaying(!showVideo);
  };

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
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Media Section */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.video_url && showVideo ? (
              <video
                src={product.video_url}
                controls
                autoPlay={isPlaying}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {product.video_url && (
                <Toggle
                  pressed={showVideo}
                  onPressedChange={toggleMediaType}
                  size="sm"
                >
                  {showVideo ? <Play className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                </Toggle>
              )}
            </div>
            <div className="flex gap-2">
              {product.image_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(product.image_url, 'image')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              )}
              {product.video_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(product.video_url, 'video')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}
          </div>

          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {product.strain && (
            <div>
              <h3 className="text-lg font-semibold mb-1">Strain</h3>
              <p>{product.strain}</p>
            </div>
          )}

          {(product.regular_price !== undefined && product.regular_price > 0) && (
            <div>
              <h3 className="text-lg font-semibold mb-1">Price</h3>
              <p className="text-2xl font-bold">
                ${product.regular_price.toFixed(2)}
              </p>
              {(product.shipping_price !== undefined && product.shipping_price > 0) && (
                <p className="text-sm text-gray-600">
                  + ${product.shipping_price.toFixed(2)} shipping
                </p>
              )}
            </div>
          )}

          {(product.stock !== undefined && product.stock > 0) && (
            <div>
              <h3 className="text-lg font-semibold mb-1">Stock</h3>
              <p>{product.stock} available</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          {product.video_url && showVideo ? (
            <video
              src={product.video_url}
              controls
              autoPlay={isPlaying}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}