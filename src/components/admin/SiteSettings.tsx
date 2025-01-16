import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    primary_color: "",
    secondary_color: "",
    font_family: "",
    storefront_password: "",
    admin_password: "",
    pwa_short_name: "",
    pwa_display: "standalone",
    pwa_orientation: "portrait",
    pwa_scope: "/",
    pwa_start_url: "/",
    pwa_icons: [],
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
      
      if (data) {
        // Ensure pwa_icons is properly parsed and typed
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("site_settings")
        .update(settings)
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleIconUpload = (url: string, size: number) => {
    const newIcon = {
      src: url,
      sizes: `${size}x${size}`,
      type: "image/png"
    };

    // Remove any existing icon with the same size
    const filteredIcons = settings.pwa_icons.filter(icon => icon.sizes !== `${size}x${size}`);
    
    setSettings(prev => ({
      ...prev,
      pwa_icons: [...filteredIcons, newIcon]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <Tabs defaultValue="site" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="pwa">PWA Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="w-32 h-32 object-contain rounded-md mb-2" />
            )}
            <FileUpload
              onUploadComplete={(url) => setSettings(prev => ({ ...prev, logo_url: url }))}
              accept="image/*"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Favicon</label>
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Favicon" className="w-16 h-16 object-contain rounded-md mb-2" />
            )}
            <FileUpload
              onUploadComplete={(url) => setSettings(prev => ({ ...prev, favicon_url: url }))}
              accept="image/*"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <Input
              name="primary_color"
              type="color"
              value={settings.primary_color || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary Color</label>
            <Input
              name="secondary_color"
              type="color"
              value={settings.secondary_color || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <Input
              name="font_family"
              value={settings.font_family || ""}
              onChange={handleChange}
              placeholder="Enter font family name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Storefront Password</label>
            <Input
              name="storefront_password"
              type="password"
              value={settings.storefront_password || ""}
              onChange={handleChange}
              placeholder="Enter storefront password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Password</label>
            <Input
              name="admin_password"
              type="password"
              value={settings.admin_password || ""}
              onChange={handleChange}
              placeholder="Enter admin password"
            />
          </div>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">PWA Name</label>
            <Input
              name="pwa_name"
              value={settings.pwa_name || ""}
              onChange={handleChange}
              placeholder="Enter PWA name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PWA Short Name</label>
            <Input
              name="pwa_short_name"
              value={settings.pwa_short_name || ""}
              onChange={handleChange}
              placeholder="Enter PWA short name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PWA Description</label>
            <Input
              name="pwa_description"
              value={settings.pwa_description || ""}
              onChange={handleChange}
              placeholder="Enter PWA description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Theme Color</label>
            <Input
              name="pwa_theme_color"
              type="color"
              value={settings.pwa_theme_color || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Background Color</label>
            <Input
              name="pwa_background_color"
              type="color"
              value={settings.pwa_background_color || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Mode</label>
            <Input
              name="pwa_display"
              value={settings.pwa_display || ""}
              onChange={handleChange}
              placeholder="Enter display mode (e.g., standalone, fullscreen)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Orientation</label>
            <Input
              name="pwa_orientation"
              value={settings.pwa_orientation || ""}
              onChange={handleChange}
              placeholder="Enter orientation (e.g., portrait, landscape)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scope</label>
            <Input
              name="pwa_scope"
              value={settings.pwa_scope || ""}
              onChange={handleChange}
              placeholder="Enter PWA scope (e.g., /)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start URL</label>
            <Input
              name="pwa_start_url"
              value={settings.pwa_start_url || ""}
              onChange={handleChange}
              placeholder="Enter start URL (e.g., /)"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">PWA Icons</label>
            <p className="text-sm text-muted-foreground">Upload icons for different sizes. All icons should be square PNG images.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {PWA_ICON_SIZES.map((size) => (
                <div key={size} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{size}x{size}</label>
                    {settings.pwa_icons.find(icon => icon.sizes === `${size}x${size}`) && (
                      <span className="text-xs text-green-500">✓ Uploaded</span>
                    )}
                  </div>
                  <FileUpload
                    onUploadComplete={(url) => handleIconUpload(url, size)}
                    accept="image/png"
                  />
                  {settings.pwa_icons.find(icon => icon.sizes === `${size}x${size}`) && (
                    <img
                      src={settings.pwa_icons.find(icon => icon.sizes === `${size}x${size}`)?.src}
                      alt={`PWA Icon ${size}x${size}`}
                      className="w-16 h-16 object-contain rounded-md mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}