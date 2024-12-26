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
              className="absolute bottom-4 right-4 rounded-full"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {(strain || potency) && (
            <div className="flex gap-4 text-sm text-gray-600">
              {strain && <span>Strain: {strain}</span>}
              {potency && <span>THC: {potency}</span>}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(image, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Image
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