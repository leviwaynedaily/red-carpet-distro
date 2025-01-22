import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Play, X, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { useIsMobile } from "@/hooks/use-mobile";

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
  media?: {
    webp?: string;
  };
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
  media,
}: ProductCardProps) => {
  const isMobile = useIsMobile();
  const [showMedia, setShowMedia] = useState(false);
  const [showVideo, setShowVideo] = useState(!!video && primary_media_type === 'video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [webpError, setWebpError] = useState(false);

  const validCategories = categories?.filter(category => category && category.trim() !== '') || [];

  useEffect(() => {
    if (showMedia && video && showVideo) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [showMedia, video, showVideo]);

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMedia(true);
  };

  const handleClose = () => {
    setShowMedia(false);
    setIsPlaying(false);
  };

  const toggleMediaType = () => {
    setShowVideo(!showVideo);
    setIsPlaying(!showVideo);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load product image:', e);
    setImageError(true);
    e.currentTarget.src = '/placeholder.svg';
  };

  const handleWebPError = (e: React.SyntheticEvent<HTMLSourceElement, Event>) => {
    console.log('WebP image failed to load, falling back to PNG:', e);
    setWebpError(true);
  };

  const cardClasses = {
    small: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    medium: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    large: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
  };

  const imageContainerClasses = {
    small: "w-full h-48 relative overflow-hidden bg-gray-100",
    medium: "w-full h-48 relative overflow-hidden bg-gray-100",
    large: "w-full h-48 relative overflow-hidden bg-gray-100"
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

  const renderImage = () => {
    if (!image && !media?.webp) {
      return (
        <div className={`${imageContainerClasses[viewMode]} flex items-center justify-center`}>
          <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <Image className="h-8 w-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Image coming soon</p>
          </div>
        </div>
      );
    }

    return (
      <div className={imageContainerClasses[viewMode]}>
        <picture>
          {media?.webp && (
            <source
              srcSet={media.webp}
              type="image/webp"
              onError={handleWebPError}
            />
          )}
          <img
            src={image}
            alt={name}
            className={imageClasses[viewMode]}
            loading="lazy"
            onError={handleImageError}
          />
        </picture>
      </div>
    );
  };

  const renderMediaContent = () => {
    return (
      <div className="relative">
        <div className="absolute right-4 top-4 z-50 flex gap-2">
          {video && (
            <Toggle
              pressed={showVideo}
              onPressedChange={toggleMediaType}
              size="sm"
              className="bg-white/90 hover:bg-white rounded-full"
            >
              {showVideo ? <Play className="h-4 w-4" /> : <Image className="h-4 w-4" />}
            </Toggle>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-hidden">
          {(video && showVideo) ? (
            <video
              src={video}
              controls
              autoPlay={isPlaying}
              className="w-full h-full object-contain"
            />
          ) : (
            <picture>
              {media?.webp && (
                <source
                  srcSet={media.webp}
                  type="image/webp"
                  onError={handleWebPError}
                />
              )}
              <img
                src={image}
                alt={name}
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
            </picture>
          )}
        </div>
        <div className="p-6">
          {validCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {validCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category.trim()}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}
          {strain && (
            <div className="flex gap-2 text-sm text-gray-600 mb-4">
              <span>Strain: {strain}</span>
            </div>
          )}
          <div className="space-y-1">
            {regular_price !== undefined && regular_price !== null && regular_price > 0 && (
              <div className="text-lg font-medium">
                {formatPrice(regular_price)}
              </div>
            )}
            {shipping_price !== undefined && shipping_price !== null && shipping_price > 0 && (
              <div className="text-sm text-gray-600">
                + {formatPrice(shipping_price)} shipping
              </div>
            )}
            {stock !== undefined && stock !== null && stock > 0 && (
              <div className="text-sm text-gray-600">
                {stock} in stock
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card 
        className={cardClasses[viewMode]}
        onClick={() => setShowMedia(true)}
      >
        <CardHeader className="p-0 relative">
          {renderImage()}
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

      <Sheet open={showMedia} onOpenChange={setShowMedia}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={isMobile ? "h-[90vh] p-0" : "w-[90vw] max-w-4xl p-0"}
        >
          {renderMediaContent()}
        </SheetContent>
      </Sheet>
    </>
  );
};
