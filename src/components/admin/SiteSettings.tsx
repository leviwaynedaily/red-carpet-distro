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
      
      // Parse the pwa_icons JSON into the correct type
      if (data) {
        const parsedData: SiteSettingsType = {
          ...data,
          pwa_icons: Array.isArray(data.pwa_icons) ? data.pwa_icons : [],
        };
        setSettings(parsedData);
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

          <div className="space-y-2">
            <label className="text-sm font-medium">PWA Icon</label>
            <FileUpload
              onUploadComplete={(url) => {
                const newIcon = {
                  src: url,
                  sizes: "192x192",
                  type: "image/png"
                };
                setSettings(prev => ({
                  ...prev,
                  pwa_icons: [...(prev.pwa_icons || []), newIcon]
                }));
              }}
              accept="image/*"
            />
            {settings.pwa_icons && settings.pwa_icons.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {settings.pwa_icons.map((icon, index) => (
                  <img
                    key={index}
                    src={icon.src}
                    alt={`PWA Icon ${index + 1}`}
                    className="w-16 h-16 object-contain rounded-md"
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}
