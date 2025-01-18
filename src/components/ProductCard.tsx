import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, X, Image } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";

interface ProductCardProps {
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
  viewMode: 'small' | 'medium' | 'large';
  primary_media_type?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  video,
  categories,
  strain,
  stock,
  regular_price,
  shipping_price,
  viewMode,
  primary_media_type,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMedia, setShowMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const validCategories = categories?.filter(category => category && category.trim() !== '') || [];

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMedia(true);
    if (video && showVideo) setIsPlaying(true);
  };

  const handleClose = () => {
    setShowMedia(false);
    setIsPlaying(false);
    setShowVideo(false);
  };

  const toggleMediaType = () => {
    setShowVideo(!showVideo);
    setIsPlaying(!showVideo);
  };

  const cardClasses = {
    small: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    medium: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    large: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
  };

  const imageClasses = {
    small: "w-full h-full object-cover",
    medium: "w-full h-full object-cover",
    large: "w-full h-full object-cover"
  };

  const contentClasses = {
    small: "p-2",
    medium: "p-3",
    large: "p-4"
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <>
      <Card 
        className={cardClasses[viewMode]}
        onClick={handleCardClick}
      >
        <CardHeader className="p-0 relative aspect-square">
          {image ? (
            <picture>
              {product?.media?.webp && (
                <source srcSet={product.media.webp} type="image/webp" />
              )}
              <img
                src={image}
                alt={name}
                className={imageClasses[viewMode]}
                loading="lazy"
              />
            </picture>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Image coming soon</p>
              </div>
            </div>
          )}
          {video && primary_media_type === 'video' && (
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full w-6 h-6"
                onClick={handleMediaClick}
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className={contentClasses[viewMode]}>
          {validCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {validCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category.trim()}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-sm font-semibold mb-1 truncate">{name}</h3>
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}
          {strain && (
            <div className="flex gap-2 text-xs text-gray-600 mt-2">
              <span>Strain: {strain}</span>
            </div>
          )}
          <div className="mt-2 space-y-1">
            {regular_price !== undefined && regular_price !== null && regular_price > 0 && (
              <div className="text-sm font-medium">
                {formatPrice(regular_price)}
              </div>
            )}
            {shipping_price !== undefined && shipping_price !== null && shipping_price > 0 && (
              <div className="text-xs text-gray-600">
                + {formatPrice(shipping_price)} shipping
              </div>
            )}
            {stock !== undefined && stock !== null && stock > 0 && (
              <div className="text-xs text-gray-600">
                {stock} in stock
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            {video && (
              <Toggle
                pressed={showVideo}
                onPressedChange={toggleMediaType}
                size="sm"
                className="bg-white/90 hover:bg-white"
              >
                {showVideo ? <Play className="h-4 w-4" /> : <Image className="h-4 w-4" />}
              </Toggle>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {(video && showVideo) ? (
            <video
              src={video}
              controls
              autoPlay={isPlaying}
              className="w-full h-full object-contain"
            />
          ) : (
            image && (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-contain"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
