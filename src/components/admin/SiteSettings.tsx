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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { convertToWebP } from "@/utils/imageUtils";
import { PWAIcons } from "./pwa/PWAIcons";
import { PWAScreenshots } from "./pwa/PWAScreenshots";
import { IconStatus } from "./pwa/IconStatus";
import type { PWAIcon } from "@/types/site-settings";

const PWA_ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

type SiteSettingsType = {
  id: string;
  logo_url: string;
  logo_url_webp?: string;
  favicon_url: string;
  favicon_png_url?: string;
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
  og_image_webp: string;
  og_url: string;
  show_site_logo: boolean;
  show_site_description: boolean;
  site_description: string;
  header_color: string;
  header_opacity: number;
  toolbar_color: string;
  toolbar_opacity: number;
};

export function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsType>({
    id: "",
    logo_url: "",
    logo_url_webp: "",
    favicon_url: "",
    favicon_png_url: "",
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
    og_image_webp: "",
    og_url: "https://palmtreesmokes.com",
    show_site_logo: true,
    show_site_description: true,
    site_description: "Welcome to Palmtree Smokes, your premium destination for quality cannabis products. Browse our carefully curated selection below.",
    header_color: "#FFFFFF",
    header_opacity: 1.0,
    toolbar_color: "#FFFFFF",
    toolbar_opacity: 1.0,
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
              type: icon.type || "",
              purpose: icon.purpose || 'any',
              webp: icon.webp || ''
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

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, header_opacity: value, toolbar_opacity: value }));
    
    toast.success('Opacity updated! Save to make permanent.', {
      description: `Header opacity changed to ${value}`,
    });
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
      
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      const ogUrlMeta = document.querySelector('meta[property="og:url"]');
      
      if (ogImageMeta) {
        const ogImageUrl = `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/og-image.png`;
        console.log('Setting og:image meta tag to:', ogImageUrl);
        ogImageMeta.setAttribute('content', ogImageUrl);
      }
      
      if (ogUrlMeta && settings.og_url) {
        console.log('Setting og:url meta tag to:', settings.og_url);
        ogUrlMeta.setAttribute('content', settings.og_url);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  const handleLogoUpload = async (url: string) => {
    console.log('Handling logo upload:', { url });
    
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
      const originalFile = new File([blob], 'logo.png', { type: 'image/png' });

      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], 'logo.webp', { type: 'image/webp' });

      console.log('Uploading WebP version...');
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload('sitesettings/logo.webp', webpFile, {
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
          logo_url: url,
          logo_url_webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/logo.webp`
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

      setSettings(prev => ({
        ...prev,
        logo_url: url,
        logo_url_webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/logo.webp`
      }));

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error in handleLogoUpload:', error);
      toast.error('Failed to process logo upload');
    }
  };

  const handleFaviconUpload = async (url: string) => {
    console.log('Handling favicon upload:', { url });
    
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

      // Handle PNG version
      const response = await fetch(url);
      const blob = await response.blob();
      const pngFile = new File([blob], 'favicon.png', { type: 'image/png' });

      console.log('Uploading PNG version...');
      const { data: pngUpload, error: pngError } = await supabase.storage
        .from('media')
        .upload('sitesettings/favicon.png', pngFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (pngError) {
        console.error('Error uploading PNG version:', pngError);
        throw pngError;
      }

      const pngUrl = `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/favicon.png`;

      // Update settings with both URLs
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          favicon_url: url,
          favicon_png_url: pngUrl
        })
        .eq('id', settings.id);

      if (updateError) {
        console.error('Error updating site settings:', updateError);
        throw updateError;
      }

      setSettings(prev => ({
        ...prev,
        favicon_url: url,
        favicon_png_url: pngUrl
      }));

      toast.success('Favicon uploaded successfully');
    } catch (error) {
      console.error('Error in handleFaviconUpload:', error);
      toast.error('Failed to process favicon upload');
    }
  };

  const handlePWAIconUpload = async (url: string, size: number) => {
    console.log('Handling PWA icon upload:', { url, size });
    try {
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (!settingsData?.id) {
        throw new Error('No settings record found');
      }

      // Convert the uploaded image to WebP
      const response = await fetch(url);
      const blob = await response.blob();
      const originalFile = new File([blob], 'icon.png', { type: 'image/png' });

      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], 'icon.webp', { type: 'image/webp' });

      // Upload WebP version
      const webpPath = `pwa/icons/icon-${size}x${size}.webp`;
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload(webpPath, webpFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (webpError) throw webpError;

      const webpUrl = `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/${webpPath}`;

      const newIcon = {
        src: url,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any' as const,
        webp: webpUrl
      };

      const currentIcons = Array.isArray(settingsData.pwa_icons) ? settingsData.pwa_icons : [];
      const updatedIcons = [...currentIcons, newIcon];

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ pwa_icons: updatedIcons })
        .eq('id', settingsData.id);

      if (updateError) throw updateError;

      setSettings(prev => ({
        ...prev,
        pwa_icons: updatedIcons
      }));

      toast.success('PWA icon uploaded successfully');
    } catch (error) {
      console.error('Error in handlePWAIconUpload:', error);
      toast.error('Failed to process PWA icon upload');
    }
  };

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

      setSettings(prev => ({
        ...prev,
        og_image: url,
        og_image_webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/og-image.webp`
      }));

      toast.success('OG image uploaded successfully');
    } catch (error) {
      console.error('Error in handleOGImageUpload:', error);
      toast.error('Failed to process OG image upload');
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

              <div className="space-y-2">
                <Label htmlFor="header_color">Header Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="header_color"
                    name="header_color"
                    type="color"
                    value={settings.header_color}
                    onChange={handleColorChange}
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">
                    {settings.header_color}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="header_opacity">Header Opacity</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="header_opacity"
                    name="header_opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.header_opacity}
                    onChange={handleOpacityChange}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {Math.round(settings.header_opacity * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolbar_color">Toolbar Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="toolbar_color"
                    name="toolbar_color"
                    type="color"
                    value={settings.toolbar_color}
                    onChange={handleColorChange}
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">
                    {settings.toolbar_color}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolbar_opacity">Toolbar Opacity</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="toolbar_opacity"
                    name="toolbar_opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.toolbar_opacity}
                    onChange={handleOpacityChange}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {Math.round(settings.toolbar_opacity * 100)}%
                  </span>
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
            <Card>
              <CardHeader>
                <CardTitle>Logo Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_site_logo"
                    checked={settings.show_site_logo}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, show_site_logo: checked }))
                    }
                  />
                  <Label htmlFor="show_site_logo">Show Site Logo</Label>
                </div>

                <Label>Logo</Label>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  {settings.logo_url && (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <img
                          src={settings.logo_url}
                          alt="Logo"
                          className="w-32 h-32 object-contain rounded-md mb-2"
                        />
                      </div>
                      <div className="ml-4">
                        <IconStatus 
                          status={{
                            png: !!settings.logo_url,
                            webp: !!settings.logo_url_webp
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <FileUpload
                      onUploadComplete={handleLogoUpload}
                      accept="image/*"
                      folderPath="sitesettings"
                      fileName="logo"
                    />
                  </div>
                </div>

                <Label>Favicon</Label>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  {settings.favicon_url && (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <img
                          src={settings.favicon_url}
                          alt="Favicon"
                          className="w-16 h-16 object-contain rounded-md mb-2"
                        />
                      </div>
                      <div className="ml-4">
                        <IconStatus 
                          status={{
                            ico: !!settings.favicon_url,
                            png: !!settings.favicon_png_url
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <FileUpload
                      onUploadComplete={handleFaviconUpload}
                      accept="image/*"
                      folderPath="sitesettings"
                      fileName="favicon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_site_description"
                    checked={settings.show_site_description}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, show_site_description: checked }))
                    }
                  />
                  <Label htmlFor="show_site_description">Show Site Description</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        site_description: e.target.value,
                      }))
                    }
                    placeholder="Enter site description"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Label htmlFor="favicon_url">Favicon</Label>
            {settings.favicon_url && (
              <img src={addCacheBuster(settings.favicon_url)} alt="Favicon" className="w-16 h-16 object-contain rounded-md mb-2" />
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
            <PWAScreenshots
              desktopScreenshot={settings.pwa_desktop_screenshot || null}
              mobileScreenshot={settings.pwa_mobile_screenshot || null}
              onDesktopUpload={(url) => setSettings(prev => ({ ...prev, pwa_desktop_screenshot: url }))}
              onMobileUpload={(url) => setSettings(prev => ({ ...prev, pwa_mobile_screenshot: url }))}
            />

            <h3 className="text-lg font-medium mt-6">PWA Icons</h3>
            <PWAIcons
              icons={settings.pwa_icons}
              onIconUpload={handlePWAIconUpload}
              sizes={PWA_ICON_SIZES}
            />
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
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}
