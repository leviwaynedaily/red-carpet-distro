import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
import { convertToWebP } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PWAScreenshotsProps {
  desktopScreenshot: string | null;
  mobileScreenshot: string | null;
  onDesktopUpload: (url: string) => void;
  onMobileUpload: (url: string) => void;
}

interface Screenshot {
  type: 'desktop' | 'mobile';
  url: string;
  webp?: string;
}

export const PWAScreenshots: React.FC<PWAScreenshotsProps> = ({
  desktopScreenshot,
  mobileScreenshot,
  onDesktopUpload,
  onMobileUpload
}) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      console.log('Fetching screenshots data...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('pwa_desktop_screenshot, pwa_mobile_screenshot')
        .maybeSingle();

      if (error) {
        console.error('Error fetching screenshots:', error);
        throw error;
      }

      if (data) {
        console.log('Screenshots data fetched:', data);
        const screenshotsArray: Screenshot[] = [];
        
        if (data.pwa_desktop_screenshot) {
          screenshotsArray.push({
            type: 'desktop',
            url: data.pwa_desktop_screenshot
          });
        }
        
        if (data.pwa_mobile_screenshot) {
          screenshotsArray.push({
            type: 'mobile',
            url: data.pwa_mobile_screenshot
          });
        }

        setScreenshots(screenshotsArray);
      }
    } catch (error) {
      console.error('Error in fetchScreenshots:', error);
      toast.error('Failed to fetch screenshots');
    }
  };

  const handleScreenshotUpload = async (url: string, type: 'desktop' | 'mobile') => {
    console.log(`Handling ${type} screenshot upload:`, { url });
    
    try {
      // Fetch the image and create a blob
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${type}_screenshot`;
      const originalFile = new File([blob], `${fileName}.png`, { type: 'image/png' });
      
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

      // Get the settings record
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('id')
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
        throw settingsError;
      }

      if (!settings?.id) {
        throw new Error('No settings record found');
      }

      // Update the site settings with both URLs
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          [`pwa_${type}_screenshot`]: url,
          media: {
            [`${type}_screenshot_webp`]: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/pwa/${fileName}.webp`
          }
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

      // Update local state
      setScreenshots(prev => {
        const newScreenshots = [...prev];
        const existingIndex = newScreenshots.findIndex(s => s.type === type);
        const newScreenshot = {
          type,
          url,
          webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/pwa/${fileName}.webp`
        };

        if (existingIndex >= 0) {
          newScreenshots[existingIndex] = newScreenshot;
        } else {
          newScreenshots.push(newScreenshot);
        }

        return newScreenshots;
      });

      if (type === 'desktop') {
        onDesktopUpload(url);
      } else {
        onMobileUpload(url);
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} screenshot uploaded successfully`);
    } catch (error) {
      console.error(`Error in handle${type}ScreenshotUpload:`, error);
      toast.error(`Failed to process ${type} screenshot upload`);
    }
  };

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Desktop Screenshot (Wide)</Label>
        <div className="flex items-center space-x-2">
          {desktopScreenshot && (
            <img 
              src={addCacheBuster(desktopScreenshot)} 
              alt="Desktop screenshot" 
              className="w-full h-32 object-cover rounded-md mb-2"
            />
          )}
          <IconStatus 
            status={{
              png: !!desktopScreenshot,
              webp: !!screenshots.find(s => s.type === 'desktop')?.webp
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={(url) => handleScreenshotUpload(url, 'desktop')}
          accept="image/*"
          folderPath="sitesettings/pwa"
          fileName="desktop_screenshot"
        />
        <p className="text-sm text-muted-foreground">
          Add a wide screenshot for desktop PWA install UI
        </p>
      </div>

      <div className="space-y-2">
        <Label>Mobile Screenshot</Label>
        <div className="flex items-center space-x-2">
          {mobileScreenshot && (
            <img 
              src={addCacheBuster(mobileScreenshot)} 
              alt="Mobile screenshot" 
              className="w-full h-32 object-cover rounded-md mb-2"
            />
          )}
          <IconStatus 
            status={{
              png: !!mobileScreenshot,
              webp: !!screenshots.find(s => s.type === 'mobile')?.webp
            }}
          />
        </div>
        <FileUpload
          onUploadComplete={(url) => handleScreenshotUpload(url, 'mobile')}
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