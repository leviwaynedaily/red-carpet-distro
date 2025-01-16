import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";

export function SiteSettings() {
  const [settings, setSettings] = useState({
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
      if (data) setSettings(data);
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
        <label className="text-sm font-medium">PWA Name</label>
        <Input
          name="pwa_name"
          value={settings.pwa_name || ""}
          onChange={handleChange}
          placeholder="Enter PWA name"
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

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}