import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
import { Check, X } from 'lucide-react';
import { convertToWebP } from '@/utils/imageUtils';
import { supabase } from '@/integrations/supabase/client';

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

interface ImageStatus {
  dimensions: ImageDimensions | null;
  webpUrl: string | null;
  isLoading: boolean;
}

export const PWAScreenshots: React.FC<PWAScreenshotsProps> = ({
  desktopScreenshot,
  mobileScreenshot,
  onDesktopUpload,
  onMobileUpload
}) => {
  const [desktopStatus, setDesktopStatus] = useState<ImageStatus>({
    dimensions: null,
    webpUrl: null,
    isLoading: false
  });
  const [mobileStatus, setMobileStatus] = useState<ImageStatus>({
    dimensions: null,
    webpUrl: null,
    isLoading: false
  });

  const DESKTOP_DIMENSIONS = { width: 1920, height: 1080 };
  const MOBILE_DIMENSIONS = { width: 1080, height: 1920 };

  useEffect(() => {
    if (desktopScreenshot) {
      loadImageStatus(desktopScreenshot, 'desktop');
    }
    if (mobileScreenshot) {
      loadImageStatus(mobileScreenshot, 'mobile');
    }
  }, [desktopScreenshot, mobileScreenshot]);

  const loadImageStatus = async (url: string, type: 'desktop' | 'mobile') => {
    console.log(`Loading status for ${type} screenshot:`, url);
    try {
      // Get dimensions
      const dimensions = await getImageDimensions(url);
      
      // Check for WebP version
      const urlParts = url.split('.');
      const ext = urlParts.pop();
      const baseUrl = urlParts.join('.');
      const webpUrl = `${baseUrl}.webp`;

      // Check if WebP exists
      const { data: webpExists } = await supabase.storage
        .from('media')
        .list('sitesettings/pwa', {
          search: `${type}_screenshot.webp`
        });

      const status = {
        dimensions,
        webpUrl: webpExists && webpExists.length > 0 ? webpUrl : null,
        isLoading: false
      };

      if (type === 'desktop') {
        setDesktopStatus(status);
      } else {
        setMobileStatus(status);
      }

      console.log(`Status loaded for ${type}:`, status);
    } catch (error) {
      console.error(`Error loading ${type} status:`, error);
    }
  };

  const getImageDimensions = (url: string): Promise<ImageDimensions> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  };

  const handleScreenshotUpload = async (
    url: string,
    type: 'desktop' | 'mobile',
    onUpload: (url: string) => void
  ) => {
    console.log(`Handling ${type} screenshot upload:`, url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${type}_screenshot`;
      const originalFile = new File([blob], `${fileName}.png`, { type: 'image/png' });

      // Convert to WebP
      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], `${fileName}.webp`, { type: 'image/webp' });

      // Upload WebP version
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload(`sitesettings/pwa/${fileName}.webp`, webpFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (webpError) {
        console.error('Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('WebP version uploaded successfully');

      // Update status
      await loadImageStatus(url, type);

      // Call the original onUpload callback
      onUpload(url);
    } catch (error) {
      console.error(`Error in ${type} screenshot upload:`, error);
    }
  };

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
              {renderDimensionsStatus(desktopStatus.dimensions, DESKTOP_DIMENSIONS)}
            </div>
          )}
          <IconStatus 
            status={{
              png: !!desktopScreenshot,
              webp: !!desktopStatus.webpUrl
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={(url) => handleScreenshotUpload(url, 'desktop', onDesktopUpload)}
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
              {renderDimensionsStatus(mobileStatus.dimensions, MOBILE_DIMENSIONS)}
            </div>
          )}
          <IconStatus 
            status={{
              png: !!mobileScreenshot,
              webp: !!mobileStatus.webpUrl
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={(url) => handleScreenshotUpload(url, 'mobile', onMobileUpload)}
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