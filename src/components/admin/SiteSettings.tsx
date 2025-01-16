import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateRootColors } from "@/utils/colorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type PWAIcon = {
  src: string;
  sizes: string;
  type: string;
};

type SiteSettingsType = {
  id: string;
  logo_url: string;
  favicon_url: string;
  pwa_name: string;
  pwa_description: string;
  pwa_theme_color: string;
  pwa_background_color: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  storefront_password: string;
  admin_password: string;
  pwa_short_name: string;
  pwa_display: string;
  pwa_orientation: string;
  pwa_scope: string;
  pwa_start_url: string;
  pwa_icons: PWAIcon[];
  pwa_desktop_screenshot?: string;
  pwa_mobile_screenshot?: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
};

const PWA_ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

export function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsType>({
    id: "",
    logo_url: "",
    favicon_url: "",
    pwa_name: "",
    pwa_description: "",
    pwa_theme_color: "",
    pwa_background_color: "",
    primary_color: "#FF69B4",
    secondary_color: "#00A86B",
    font_family: "",
    storefront_password: "",
    admin_password: "",
    pwa_short_name: "",
    pwa_display: "standalone",
    pwa_orientation: "portrait",
    pwa_scope: "/",
    pwa_start_url: "/",
    pwa_icons: [],
    pwa_desktop_screenshot: "",
    pwa_mobile_screenshot: "",
    og_title: "",
    og_description: "",
    og_image: "",
    og_url: "https://palmtreesmokes.netlify.app",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    updateRootColors({
      primary: settings.primary_color,
      secondary: settings.secondary_color,
      background: settings.pwa_background_color,
      foreground: settings.pwa_theme_color,
    });
  }, [
    settings.primary_color,
    settings.secondary_color,
    settings.pwa_background_color,
    settings.pwa_theme_color,
  ]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) throw error;
      
      if (data) {
        const parsedIcons = Array.isArray(data.pwa_icons) 
          ? data.pwa_icons.map((icon: any) => ({
              src: icon.src || "",
              sizes: icon.sizes || "",
              type: icon.type || ""
            }))
          : [];

        setSettings({
          ...data,
          pwa_icons: parsedIcons
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    
    if (name.includes('color')) {
      toast.success('Color updated! Save to make permanent.', {
        description: `${name.replace('_', ' ')} changed to ${value}`,
      });
    }
  };

  const handlePWAIconUpload = (url: string, size: number) => {
    const newIcons = Array.isArray(settings.pwa_icons) ? [...settings.pwa_icons] : [];
    const iconIndex = newIcons.findIndex(icon => icon.sizes === `${size}x${size}`);
    
    const newIcon = {
      src: url,
      sizes: `${size}x${size}`,
      type: "image/png"
    };

    if (iconIndex !== -1) {
      newIcons[iconIndex] = newIcon;
    } else {
      newIcons.push(newIcon);
    }

    setSettings(prev => ({
      ...prev,
      pwa_icons: newIcons
    }));

    toast.success(`${size}x${size} icon updated successfully`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the public URL for the og_image from Supabase storage
      if (settings.og_image) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(settings.og_image.replace(/^.*\/media\//, ''));
        
        settings.og_image = publicUrl;
      }

      const { error } = await supabase
        .from("site_settings")
        .update(settings)
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("Settings updated successfully");
      
      // Update meta tags
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      const ogUrlMeta = document.querySelector('meta[property="og:url"]');
      
      if (ogImageMeta && settings.og_image) {
        ogImageMeta.setAttribute('content', settings.og_image);
      }
      if (ogUrlMeta && settings.og_url) {
        ogUrlMeta.setAttribute('content', settings.og_url);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="pwa">PWA Settings</TabsTrigger>
          <TabsTrigger value="og">Open Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="primary_color"
                      name="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={handleColorChange}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.primary_color}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="secondary_color"
                      name="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={handleColorChange}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.secondary_color}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwa_theme_color">Theme Color (Foreground)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="pwa_theme_color"
                      name="pwa_theme_color"
                      type="color"
                      value={settings.pwa_theme_color}
                      onChange={handleColorChange}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.pwa_theme_color}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwa_background_color">Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="pwa_background_color"
                      name="pwa_background_color"
                      type="color"
                      value={settings.pwa_background_color}
                      onChange={handleColorChange}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.pwa_background_color}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Color Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <div className="space-y-4">
            <Label htmlFor="logo_url">Logo</Label>
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="w-32 h-32 object-contain rounded-md mb-2" />
            )}
            <FileUpload
              onUploadComplete={(url) => setSettings(prev => ({ ...prev, logo_url: url }))}
              accept="image/*"
              folderPath="sitesettings"
              fileName="logo"
            />
            <Label htmlFor="favicon_url">Favicon</Label>
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Favicon" className="w-16 h-16 object-contain rounded-md mb-2" />
            )}
            <FileUpload
              onUploadComplete={(url) => setSettings(prev => ({ ...prev, favicon_url: url }))}
              accept="image/*"
              folderPath="sitesettings"
              fileName="favicon"
            />
            <Label htmlFor="font_family">Font Family</Label>
            <Input
              id="font_family"
              name="font_family"
              value={settings.font_family || ""}
              onChange={handleColorChange}
              placeholder="Enter font family name"
            />
            <Label htmlFor="storefront_password">Storefront Password</Label>
            <Input
              id="storefront_password"
              name="storefront_password"
              type="password"
              value={settings.storefront_password || ""}
              onChange={handleColorChange}
              placeholder="Enter storefront password"
            />
            <Label htmlFor="admin_password">Admin Password</Label>
            <Input
              id="admin_password"
              name="admin_password"
              type="password"
              value={settings.admin_password || ""}
              onChange={handleColorChange}
              placeholder="Enter admin password"
            />
          </div>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">PWA Screenshots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desktop Screenshot (Wide)</Label>
                {settings.pwa_desktop_screenshot && (
                  <img 
                    src={settings.pwa_desktop_screenshot} 
                    alt="Desktop screenshot" 
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <FileUpload
                  onUploadComplete={(url) => setSettings(prev => ({ ...prev, pwa_desktop_screenshot: url }))}
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
                {settings.pwa_mobile_screenshot && (
                  <img 
                    src={settings.pwa_mobile_screenshot} 
                    alt="Mobile screenshot" 
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <FileUpload
                  onUploadComplete={(url) => setSettings(prev => ({ ...prev, pwa_mobile_screenshot: url }))}
                  accept="image/*"
                  folderPath="sitesettings/pwa"
                  fileName="mobile_screenshot"
                />
                <p className="text-sm text-muted-foreground">
                  Add a mobile-optimized screenshot for PWA install UI
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6">PWA Icons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PWA_ICON_SIZES.map((size) => {
                const currentIcon = settings.pwa_icons?.find(
                  (icon) => icon.sizes === `${size}x${size}`
                );
                
                return (
                  <div key={size} className="space-y-2">
                    <Label>{size}x{size} Icon</Label>
                    {currentIcon?.src && (
                      <img 
                        src={currentIcon.src} 
                        alt={`${size}x${size} icon`} 
                        className="w-16 h-16 object-contain rounded-md mb-2"
                      />
                    )}
                    <FileUpload
                      onUploadComplete={(url) => handlePWAIconUpload(url, size)}
                      accept="image/png"
                      folderPath="sitesettings/pwa"
                      fileName={`icon-${size}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="og" className="space-y-4">
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
                  onChange={handleColorChange}
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
                  onChange={handleColorChange}
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
                  onChange={handleColorChange}
                  placeholder="Enter website URL"
                />
                <p className="text-sm text-muted-foreground">
                  The canonical URL of your website
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preview Image</Label>
                {settings.og_image && (
                  <img
                    src={settings.og_image}
                    alt="Open Graph preview"
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                <FileUpload
                  onUploadComplete={(url) =>
                    setSettings((prev) => ({ ...prev, og_image: url }))
                  }
                  accept="image/*"
                  folderPath="sitesettings"
                  fileName="og-image"
                />
                <p className="text-sm text-muted-foreground">
                  This image will be displayed when your site is shared on social
                  media (recommended size: 1200x630 pixels)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}
