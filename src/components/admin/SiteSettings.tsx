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
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Update colors whenever they change
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
    
    // Show a preview of the color change
    if (name.includes('color')) {
      toast.success('Color updated! Save to make permanent.', {
        description: `${name.replace('_', ' ')} changed to ${value}`,
      });
    }
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
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="pwa">PWA Settings</TabsTrigger>
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
            />
            <Label htmlFor="favicon_url">Favicon</Label>
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Favicon" className="w-16 h-16 object-contain rounded-md mb-2" />
            )}
            <FileUpload
              onUploadComplete={(url) => setSettings(prev => ({ ...prev, favicon_url: url }))}
              accept="image/*"
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

        <TabsContent value="pwa">
          <div className="space-y-4">
            <Label htmlFor="pwa_name">PWA Name</Label>
            <Input
              id="pwa_name"
              name="pwa_name"
              value={settings.pwa_name || ""}
              onChange={handleColorChange}
              placeholder="Enter PWA name"
            />
            <Label htmlFor="pwa_short_name">PWA Short Name</Label>
            <Input
              id="pwa_short_name"
              name="pwa_short_name"
              value={settings.pwa_short_name || ""}
              onChange={handleColorChange}
              placeholder="Enter PWA short name"
            />
            <Label htmlFor="pwa_description">PWA Description</Label>
            <Input
              id="pwa_description"
              name="pwa_description"
              value={settings.pwa_description || ""}
              onChange={handleColorChange}
              placeholder="Enter PWA description"
            />
            <Label htmlFor="pwa_display">Display Mode</Label>
            <Input
              id="pwa_display"
              name="pwa_display"
              value={settings.pwa_display || ""}
              onChange={handleColorChange}
              placeholder="Enter display mode (e.g., standalone, fullscreen)"
            />
            <Label htmlFor="pwa_orientation">Orientation</Label>
            <Input
              id="pwa_orientation"
              name="pwa_orientation"
              value={settings.pwa_orientation || ""}
              onChange={handleColorChange}
              placeholder="Enter orientation (e.g., portrait, landscape)"
            />
            <Label htmlFor="pwa_scope">Scope</Label>
            <Input
              id="pwa_scope"
              name="pwa_scope"
              value={settings.pwa_scope || ""}
              onChange={handleColorChange}
              placeholder="Enter PWA scope (e.g., /)"
            />
            <Label htmlFor="pwa_start_url">Start URL</Label>
            <Input
              id="pwa_start_url"
              name="pwa_start_url"
              value={settings.pwa_start_url || ""}
              onChange={handleColorChange}
              placeholder="Enter start URL (e.g., /)"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}
