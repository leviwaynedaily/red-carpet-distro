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
  potency?: string;
  stock?: number;
  regular_price?: number;
  shipping_price?: number;
  viewMode: 'small' | 'medium' | 'large';
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  video,
  categories,
  strain,
  potency,
  stock,
  regular_price,
  shipping_price,
  viewMode,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMedia, setShowMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

  return (
    <>
      <Card 
        className={cardClasses[viewMode]}
        onClick={() => navigate(`/product/${id}`)}
      >
        <CardHeader className="p-0 relative aspect-square">
          <img
            src={image}
            alt={name}
            className={imageClasses[viewMode]}
            loading="lazy"
          />
          {video && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full w-6 h-6"
              onClick={handleMediaClick}
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent className={contentClasses[viewMode]}>
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-sm font-semibold mb-1 truncate">{name}</h3>
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}
          {(strain || potency) && (
            <div className="flex gap-2 text-xs text-gray-600 mt-2">
              {strain && <span>Strain: {strain}</span>}
              {potency && <span>THC: {potency}</span>}
            </div>
          )}
          <div className="mt-2 space-y-1">
            {regular_price !== undefined && regular_price > 0 && (
              <div className="text-sm font-medium">
                {formatPrice(regular_price)}
              </div>
            )}
            {shipping_price !== undefined && shipping_price > 0 && (
              <div className="text-xs text-gray-600">
                + {formatPrice(shipping_price)} shipping
              </div>
            )}
            {stock !== undefined && stock > 0 && (
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
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};