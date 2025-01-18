import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { convertToWebP } from "@/utils/imageUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

export function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mediaInfo, setMediaInfo] = useState<{
    original?: { type: string; size: number; url: string };
    webp?: { type: string; size: number; url: string };
  }>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [colors, setColors] = useState({
    primary: "",
    secondary: "",
    header: "",
    toolbar: "",
  });
  const [pwaSettings, setPwaSettings] = useState({
    name: "",
    shortName: "",
    description: "",
    themeColor: "",
    backgroundColor: "",
    display: "",
    orientation: "",
    scope: "",
    startUrl: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) throw error;
      
      setSettings(data);
      setAdminPassword(data.admin_password || "");
      
      // Set colors
      setColors({
        primary: data.primary_color || "",
        secondary: data.secondary_color || "",
        header: data.header_color || "",
        toolbar: data.toolbar_color || "",
      });

      // Set PWA settings
      setPwaSettings({
        name: data.pwa_name || "",
        shortName: data.pwa_short_name || "",
        description: data.pwa_description || "",
        themeColor: data.pwa_theme_color || "",
        backgroundColor: data.pwa_background_color || "",
        display: data.pwa_display || "",
        orientation: data.pwa_orientation || "",
        scope: data.pwa_scope || "",
        startUrl: data.pwa_start_url || "",
      });

      // Fetch file information for existing media
      if (data.logo_url) {
        await fetchFileInfo(data.logo_url, 'original');
      }
      if (data.media && typeof data.media === 'object' && 'webp' in data.media) {
        await fetchFileInfo(data.media.webp as string, 'webp');
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  const fetchFileInfo = async (url: string, type: 'original' | 'webp') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      setMediaInfo(prev => ({
        ...prev,
        [type]: {
          type: blob.type,
          size: blob.size,
          url: url
        }
      }));
    } catch (error) {
      console.error(`Error fetching ${type} file info:`, error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogoUpload = async (file: File) => {
    try {
      console.log('Starting logo upload process');
      
      // Convert to WebP
      const { webpBlob } = await convertToWebP(file);
      
      // Upload original file
      const originalResponse = await supabase.storage
        .from("media")
        .upload(`sitesettings/logo.${file.name.split('.').pop()}`, file, {
          upsert: true
        });

      if (originalResponse.error) throw originalResponse.error;

      // Upload WebP version
      const webpResponse = await supabase.storage
        .from("media")
        .upload('sitesettings/logo.webp', webpBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (webpResponse.error) throw webpResponse.error;

      // Get public URLs
      const { data: originalUrl } = supabase.storage
        .from("media")
        .getPublicUrl(`sitesettings/logo.${file.name.split('.').pop()}`);

      const { data: webpUrl } = supabase.storage
        .from("media")
        .getPublicUrl('sitesettings/logo.webp');

      // Update database
      const currentMedia = settings?.media && typeof settings.media === 'object' 
        ? settings.media 
        : {};

      const { error } = await supabase
        .from("site_settings")
        .update({
          logo_url: originalUrl.publicUrl,
          media: {
            ...currentMedia,
            webp: webpUrl.publicUrl
          }
        })
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("Logo updated successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error updating logo:", error);
      toast.error("Failed to update logo");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!adminPassword) {
      toast.error("Password cannot be empty");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ admin_password: adminPassword })
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("Admin password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleColorUpdate = async (colorType: string, value: string) => {
    try {
      const updateData = {
        [colorType === 'primary' ? 'primary_color' : 
         colorType === 'secondary' ? 'secondary_color' :
         colorType === 'header' ? 'header_color' :
         'toolbar_color']: value
      };

      const { error } = await supabase
        .from("site_settings")
        .update(updateData)
        .eq("id", settings.id);

      if (error) throw error;
      setColors(prev => ({ ...prev, [colorType]: value }));
      toast.success("Color updated successfully");
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error("Failed to update color");
    }
  };

  const handlePWAUpdate = async (field: string, value: string) => {
    try {
      const updateData = {
        [`pwa_${field}`]: value
      };

      const { error } = await supabase
        .from("site_settings")
        .update(updateData)
        .eq("id", settings.id);

      if (error) throw error;
      setPwaSettings(prev => ({ ...prev, [field]: value }));
      toast.success("PWA settings updated successfully");
    } catch (error) {
      console.error("Error updating PWA settings:", error);
      toast.error("Failed to update PWA settings");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="pwa">PWA Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Site Logo</h3>
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Logo Preview</h4>
                  {settings?.logo_url && (
                    <div className="space-y-2">
                      <img
                        src={settings.logo_url}
                        alt="Site Logo"
                        className="w-32 h-32 object-contain border rounded-md"
                      />
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span>Original Format:</span>
                          {mediaInfo.original?.type.includes('png') || mediaInfo.original?.type.includes('jpeg') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p>Type: {mediaInfo.original?.type || 'Unknown'}</p>
                        <p>Size: {mediaInfo.original ? formatFileSize(mediaInfo.original.size) : 'Unknown'}</p>
                      </div>
                    </div>
                  )}
                  <FileUpload
                    onUploadComplete={handleLogoUpload}
                    accept="image/*"
                    bucket="media"
                    folderPath="sitesettings"
                    fileName="logo"
                  />
                </div>

                {settings?.media && typeof settings.media === 'object' && 'webp' in settings.media && (
                  <div className="space-y-2">
                    <h4 className="font-medium">WebP Version</h4>
                    <div className="space-y-2">
                      <img
                        src={settings.media.webp as string}
                        alt="Site Logo WebP"
                        className="w-32 h-32 object-contain border rounded-md"
                      />
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span>WebP:</span>
                          {mediaInfo.webp?.type.includes('webp') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p>Type: {mediaInfo.webp?.type || 'Unknown'}</p>
                        <p>Size: {mediaInfo.webp ? formatFileSize(mediaInfo.webp.size) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Admin Password</h3>
            <div className="flex gap-2">
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter new admin password"
              />
              <Button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorUpdate('primary', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorUpdate('primary', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Header Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.header}
                  onChange={(e) => handleColorUpdate('header', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={colors.header}
                  onChange={(e) => handleColorUpdate('header', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Toolbar Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colors.toolbar}
                  onChange={(e) => handleColorUpdate('toolbar', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={colors.toolbar}
                  onChange={(e) => handleColorUpdate('toolbar', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">App Name</label>
              <Input
                type="text"
                value={pwaSettings.name}
                onChange={(e) => handlePWAUpdate('name', e.target.value)}
                placeholder="Your App Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Name</label>
              <Input
                type="text"
                value={pwaSettings.shortName}
                onChange={(e) => handlePWAUpdate('short_name', e.target.value)}
                placeholder="App"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                type="text"
                value={pwaSettings.description}
                onChange={(e) => handlePWAUpdate('description', e.target.value)}
                placeholder="App description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={pwaSettings.themeColor}
                  onChange={(e) => handlePWAUpdate('theme_color', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={pwaSettings.themeColor}
                  onChange={(e) => handlePWAUpdate('theme_color', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Background Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={pwaSettings.backgroundColor}
                  onChange={(e) => handlePWAUpdate('background_color', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={pwaSettings.backgroundColor}
                  onChange={(e) => handlePWAUpdate('background_color', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Mode</label>
              <Input
                type="text"
                value={pwaSettings.display}
                onChange={(e) => handlePWAUpdate('display', e.target.value)}
                placeholder="standalone"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Orientation</label>
              <Input
                type="text"
                value={pwaSettings.orientation}
                onChange={(e) => handlePWAUpdate('orientation', e.target.value)}
                placeholder="portrait"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scope</label>
              <Input
                type="text"
                value={pwaSettings.scope}
                onChange={(e) => handlePWAUpdate('scope', e.target.value)}
                placeholder="/"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start URL</label>
              <Input
                type="text"
                value={pwaSettings.startUrl}
                onChange={(e) => handlePWAUpdate('start_url', e.target.value)}
                placeholder="/"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}