import React from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
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
  const handleScreenshotUpload = async (url: string, type: 'desktop' | 'mobile') => {
    console.log(`Handling ${type} screenshot upload:`, { url });
    
    try {
      // Get the settings record
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
        throw settingsError;
      }

      if (!settings?.id) {
        throw new Error('No settings record found');
      }

      // Update the site settings with the URL directly
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          [`pwa_${type}_screenshot`]: url
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

      // Update local state through callback
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
              webp: false // We're not using WebP anymore
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
              webp: false // We're not using WebP anymore
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