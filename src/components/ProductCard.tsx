import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, Play, X } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  description: string;
  image: string;
  video?: string;
  categories: string[];
  strain?: string;
  potency?: string;
}

export const ProductCard = ({
  name,
  description,
  image,
  video,
  categories,
  strain,
  potency,
}: ProductCardProps) => {
  const [showMedia, setShowMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMediaClick = () => {
    setShowMedia(true);
    if (video) setIsPlaying(true);
  };

  const handleClose = () => {
    setShowMedia(false);
    setIsPlaying(false);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="p-0 relative aspect-square cursor-pointer" onClick={handleMediaClick}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {video && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full w-6 h-6"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-3">
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
            onClick={() => window.open(image, '_blank')}
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