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

export const PWAScreenshots: React.FC<PWAScreenshotsProps> = ({
  desktopScreenshot,
  mobileScreenshot,
  onDesktopUpload,
  onMobileUpload
}) => {
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettingsId();
  }, []);

  const fetchSettingsId = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (error) {
        console.error('Error fetching settings ID:', error);
        throw error;
      }

      if (data?.id) {
        setSettingsId(data.id);
      }
    } catch (error) {
      console.error('Error in fetchSettingsId:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  const handleScreenshotUpload = async (url: string, type: 'desktop' | 'mobile') => {
    if (!settingsId) {
      console.error('Settings ID not found');
      toast.error('Could not update settings: Settings ID not found');
      return;
    }

    console.log(`Handling ${type} screenshot upload:`, url);
    
    try {
      // Fetch the image once and create a blob
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${type}_screenshot`;
      const originalFile = new File([blob], `${fileName}.png`, { type: 'image/png' });
      
      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], `${fileName}.webp`, { type: 'image/webp' });
      
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

      // Update the site settings with both URLs
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          [`pwa_${type}_screenshot`]: url,
          media: {
            [`${type}_screenshot_webp`]: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/pwa/${fileName}.webp`
          }
        })
        .eq('id', settingsId);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

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
              webp: !!desktopScreenshot
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
              webp: !!mobileScreenshot
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