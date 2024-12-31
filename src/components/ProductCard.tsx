import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, Play, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  video?: string;
  categories: string[];
  strain?: string;
  potency?: string;
  viewMode: 'grid' | 'list' | 'compact';
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
  viewMode,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMedia, setShowMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMedia(true);
    if (video) setIsPlaying(true);
  };

  const handleClose = () => {
    setShowMedia(false);
    setIsPlaying(false);
  };

  const cardClasses = {
    grid: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    list: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer flex",
    compact: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
  };

  const imageClasses = {
    grid: "w-full h-full object-cover",
    list: "w-48 h-48 object-cover",
    compact: "w-full h-full object-cover"
  };

  const contentClasses = {
    grid: "p-3",
    list: "p-4 flex-1",
    compact: "p-2"
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
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          <h3 className="text-sm font-semibold mb-1 truncate">{name}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          {(strain || potency) && (
            <div className="flex gap-2 text-xs text-gray-600 mt-2">
              {strain && <span>Strain: {strain}</span>}
              {potency && <span>THC: {potency}</span>}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.open(image, '_blank');
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            Download
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          {video && isPlaying ? (
            <video
              src={video}
              controls
              autoPlay
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