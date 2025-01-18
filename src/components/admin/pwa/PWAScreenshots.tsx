import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
import { Check, X } from 'lucide-react';

interface PWAScreenshotsProps {
  desktopScreenshot: string | null;
  mobileScreenshot: string | null;
  onDesktopUpload: (url: string) => void;
  onMobileUpload: (url: string) => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export const PWAScreenshots: React.FC<PWAScreenshotsProps> = ({
  desktopScreenshot,
  mobileScreenshot,
  onDesktopUpload,
  onMobileUpload
}) => {
  const [desktopDimensions, setDesktopDimensions] = useState<ImageDimensions | null>(null);
  const [mobileDimensions, setMobileDimensions] = useState<ImageDimensions | null>(null);

  const DESKTOP_DIMENSIONS = { width: 1920, height: 1080 };
  const MOBILE_DIMENSIONS = { width: 1080, height: 1920 };

  const getImageDimensions = (url: string): Promise<ImageDimensions> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  };

  useEffect(() => {
    if (desktopScreenshot) {
      getImageDimensions(desktopScreenshot).then(setDesktopDimensions);
    }
    if (mobileScreenshot) {
      getImageDimensions(mobileScreenshot).then(setMobileDimensions);
    }
  }, [desktopScreenshot, mobileScreenshot]);

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  const isDimensionsValid = (current: ImageDimensions | null, required: ImageDimensions) => {
    if (!current) return false;
    return current.width === required.width && current.height === required.height;
  };

  const renderDimensionsStatus = (current: ImageDimensions | null, required: ImageDimensions) => {
    if (!current) return null;

    const isValid = isDimensionsValid(current, required);
    return (
      <div className="flex items-center gap-2 mt-1 text-sm">
        <span>
          Current size: {current.width}x{current.height}
        </span>
        {isValid ? (
          <Check className="text-green-500 h-4 w-4" />
        ) : (
          <X className="text-red-500 h-4 w-4" />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Desktop Screenshot ({DESKTOP_DIMENSIONS.width}x{DESKTOP_DIMENSIONS.height})</Label>
        <div className="flex items-center space-x-2">
          {desktopScreenshot && (
            <div className="space-y-2">
              <img 
                src={addCacheBuster(desktopScreenshot)} 
                alt="Desktop screenshot" 
                className="w-full h-32 object-cover rounded-md"
              />
              {renderDimensionsStatus(desktopDimensions, DESKTOP_DIMENSIONS)}
            </div>
          )}
          <IconStatus 
            status={{
              png: !!desktopScreenshot,
              webp: !!desktopScreenshot?.includes('.webp')
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={onDesktopUpload}
          accept="image/*"
          folderPath="sitesettings/pwa"
          fileName="desktop_screenshot"
        />
        <p className="text-sm text-muted-foreground">
          Add a wide screenshot for desktop PWA install UI
        </p>
      </div>

      <div className="space-y-2">
        <Label>Mobile Screenshot ({MOBILE_DIMENSIONS.width}x{MOBILE_DIMENSIONS.height})</Label>
        <div className="flex items-center space-x-2">
          {mobileScreenshot && (
            <div className="space-y-2">
              <img 
                src={addCacheBuster(mobileScreenshot)} 
                alt="Mobile screenshot" 
                className="w-full h-32 object-cover rounded-md"
              />
              {renderDimensionsStatus(mobileDimensions, MOBILE_DIMENSIONS)}
            </div>
          )}
          <IconStatus 
            status={{
              png: !!mobileScreenshot,
              webp: !!mobileScreenshot?.includes('.webp')
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={onMobileUpload}
          accept="image/*"
          folderPath="sitesettings/pwa"
          fileName="mobile_screenshot"
        />
        <p className="text-sm text-muted-foreground">
          Add a mobile-optimized screenshot for PWA install UI
        </p>
      </div>
    </div>
  );
};