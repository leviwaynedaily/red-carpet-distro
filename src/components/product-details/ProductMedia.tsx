import { useState } from "react";
import { Play, Image, Download } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductMediaProps {
  imageUrl?: string;
  videoUrl?: string;
  productName: string;
}

export const ProductMedia = ({ imageUrl, videoUrl, productName }: ProductMediaProps) => {
  const [showMedia, setShowMedia] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = async (url: string, type: 'image' | 'video') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${productName || 'download'}.${type === 'image' ? 'png' : 'mp4'}`;
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

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {videoUrl && showVideo ? (
          <video
            src={videoUrl}
            controls
            autoPlay={isPlaying}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {videoUrl && (
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
          {imageUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(imageUrl, 'image')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          )}
          {videoUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(videoUrl, 'video')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Video
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          {videoUrl && showVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay={isPlaying}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};