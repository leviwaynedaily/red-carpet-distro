import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from "../pwa/IconStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { convertToWebP } from "@/utils/imageUtils";

interface OpenGraphSettingsProps {
  settings: {
    og_title: string;
    og_description: string;
    og_url: string;
    og_image: string;
    og_image_webp: string;
  };
  onSettingChange: (name: string, value: string) => void;
}

export function OpenGraphSettings({ settings, onSettingChange }: OpenGraphSettingsProps) {
  const handleOGImageUpload = async (url: string) => {
    console.log('Handling OG image upload:', { url });
    
    try {
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

      const response = await fetch(url);
      const blob = await response.blob();
      const originalFile = new File([blob], 'og-image.png', { type: 'image/png' });

      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], 'og-image.webp', { type: 'image/webp' });

      console.log('Uploading WebP version...');
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload('sitesettings/og-image.webp', webpFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (webpError) {
        console.error('Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('WebP version uploaded successfully');

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          og_image: url,
          og_image_webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/og-image.webp`
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

      onSettingChange('og_image', url);
      onSettingChange('og_image_webp', `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/og-image.webp`);

      toast.success('OG image uploaded successfully');
    } catch (error) {
      console.error('Error in handleOGImageUpload:', error);
      toast.error('Failed to process OG image upload');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Graph Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="og_title">Title</Label>
          <Input
            id="og_title"
            name="og_title"
            value={settings.og_title}
            onChange={(e) => onSettingChange('og_title', e.target.value)}
            placeholder="Enter Open Graph title"
          />
          <p className="text-sm text-muted-foreground">
            The title that appears in social media previews
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og_description">Description</Label>
          <Input
            id="og_description"
            name="og_description"
            value={settings.og_description}
            onChange={(e) => onSettingChange('og_description', e.target.value)}
            placeholder="Enter Open Graph description"
          />
          <p className="text-sm text-muted-foreground">
            A brief description that appears in social media previews
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og_url">URL</Label>
          <Input
            id="og_url"
            name="og_url"
            value={settings.og_url}
            onChange={(e) => onSettingChange('og_url', e.target.value)}
            placeholder="Enter website URL"
          />
          <p className="text-sm text-muted-foreground">
            The canonical URL of your website
          </p>
        </div>

        <div className="space-y-2">
          <Label>Preview Image</Label>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {settings.og_image && (
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <img
                    src={settings.og_image}
                    alt="Open Graph preview"
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                </div>
                <div className="ml-4">
                  <IconStatus 
                    status={{
                      png: !!settings.og_image,
                      webp: !!settings.og_image_webp
                    }}
                  />
                </div>
              </div>
            )}
            <div className="p-4">
              <FileUpload
                onUploadComplete={handleOGImageUpload}
                accept="image/*"
                folderPath="sitesettings"
                fileName="og-image.png"
              />
              <p className="text-sm text-muted-foreground mt-2">
                This image will be displayed when your site is shared on social
                media (recommended size: 1200x630 pixels)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}