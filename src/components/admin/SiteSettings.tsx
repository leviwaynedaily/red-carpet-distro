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

type PWAIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose: 'any' | 'maskable';
  webp?: string;
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
  pwa_desktop_screenshot_webp?: string;
  pwa_mobile_screenshot?: string;
  pwa_mobile_screenshot_webp?: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  show_site_logo: boolean;
  show_site_description: boolean;
  site_description: string;
  header_color: string;
  header_opacity: number;
  toolbar_color: string;
  toolbar_opacity: number;
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

  const handleScreenshotUpload = async (url: string, type: 'desktop' | 'mobile') => {
    console.log(`Handling ${type} screenshot upload:`, { url });
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const originalFile = new File([blob], `${type}-screenshot.png`, { type: 'image/png' });
      
      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], `${type}-screenshot.webp`, { type: 'image/webp' });
      
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload(`sitesettings/pwa/${type}-screenshot.webp`, webpFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (webpError) {
        console.error('Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('WebP version uploaded successfully');

      setSettings(prev => ({
        ...prev,
        [`pwa_${type}_screenshot`]: url,
        [`pwa_${type}_screenshot_webp`]: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/pwa/${type}-screenshot.webp`
      }));

      console.log('Settings updated with new screenshot versions');
    } catch (error) {
      console.error(`Error in handle${type}ScreenshotUpload:`, error);
      toast.error('Failed to process screenshot upload');
    }
  };

  const getScreenshotStatus = (type: 'desktop' | 'mobile') => {
    const png = settings[`pwa_${type}_screenshot`];
    const webp = settings[`pwa_${type}_screenshot_webp`];
    return {
      png: !!png,
      webp: !!webp
    };
  };

  const getIconStatus = (icon?: PWAIcon) => {
    return {
      png: !!icon?.src,
      webp: !!icon?.webp
    };
  };

  const handlePWAIconUpload = async (url: string, size: number, purpose: 'any' | 'maskable') => {
    console.log(`Handling PWA icon upload for size ${size}x${size}, purpose: ${purpose}`);
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const originalFile = new File([blob], `icon-${size}-${purpose}.png`, { type: 'image/png' });
      
      console.log('Converting to WebP...');
      const { webpBlob } = await convertToWebP(originalFile);
      const webpFile = new File([webpBlob], `icon-${size}-${purpose}.webp`, { type: 'image/webp' });
      
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('media')
        .upload(`sitesettings/pwa/icon-${size}-${purpose}.webp`, webpFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (webpError) {
        console.error('Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('WebP version uploaded successfully');

      const newIcon: PWAIcon = {
        src: url,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: purpose,
        webp: `https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/pwa/icon-${size}-${purpose}.webp`
      };

      setSettings(prev => ({
        ...prev,
        pwa_icons: [
          ...prev.pwa_icons.filter(icon => 
            !(icon.sizes === `${size}x${size}` && icon.purpose === purpose)
          ),
          newIcon
        ]
      }));

      console.log('Settings updated with new icon versions');
    } catch (error) {
      console.error(`Error in handlePWAIconUpload:`, error);
      toast.error('Failed to process icon upload');
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
                {settings.logo_url && (
                  <img
                    src={addCacheBuster(settings.logo_url)}
                    alt="Logo"
                    className="w-32 h-32 object-contain rounded-md mb-2"
                  />
                )}
                <FileUpload
                  onUploadComplete={(url) =>
                    setSettings((prev) => ({ ...prev, logo_url: url }))
                  }
                  accept="image/*"
                  folderPath="sitesettings"
                  fileName="logo"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desktop Screenshot (Wide)</Label>
                <div className="flex items-center space-x-2">
                  {settings.pwa_desktop_screenshot && (
                    <img 
                      src={addCacheBuster(settings.pwa_desktop_screenshot)} 
                      alt="Desktop screenshot" 
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col space-y-1 text-sm">
                    {(() => {
                      const status = getScreenshotStatus('desktop');
                      return (
                        <>
                          <span className={`flex items-center ${status.png ? 'text-green-500' : 'text-gray-400'}`}>
                            {status.png ? '✓' : '○'} PNG
                          </span>
                          <span className={`flex items-center ${status.webp ? 'text-green-500' : 'text-gray-400'}`}>
                            {status.webp ? '✓' : '○'} WebP
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <FileUpload
                  onUploadComplete={(url) => handleScreenshotUpload(url, 'desktop')}
                  accept="image/*"
                  folderPath="sitesettings/pwa"
                  fileName="desktop-screenshot"
                />
                <p className="text-sm text-muted-foreground">
                  Add a wide screenshot for desktop PWA install UI
                </p>
              </div>

              <div className="space-y-2">
                <Label>Mobile Screenshot</Label>
                <div className="flex items-center space-x-2">
                  {settings.pwa_mobile_screenshot && (
                    <img 
                      src={addCacheBuster(settings.pwa_mobile_screenshot)} 
                      alt="Mobile screenshot" 
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col space-y-1 text-sm">
                    {(() => {
                      const status = getScreenshotStatus('mobile');
                      return (
                        <>
                          <span className={`flex items-center ${status.png ? 'text-green-500' : 'text-gray-400'}`}>
                            {status.png ? '✓' : '○'} PNG
                          </span>
                          <span className={`flex items-center ${status.webp ? 'text-green-500' : 'text-gray-400'}`}>
                            {status.webp ? '✓' : '○'} WebP
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <FileUpload
                  onUploadComplete={(url) => handleScreenshotUpload(url, 'mobile')}
                  accept="image/*"
                  folderPath="sitesettings/pwa"
                  fileName="mobile-screenshot"
                />
                <p className="text-sm text-muted-foreground">
                  Add a mobile-optimized screenshot for PWA install UI
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6">PWA Icons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PWA_ICON_SIZES.map((size) => (
                <div key={size} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{size}x{size} Regular Icon</Label>
                    <div className="flex items-center space-x-2">
                      {settings.pwa_icons?.find(
                        icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                      )?.src && (
                        <img 
                          src={addCacheBuster(settings.pwa_icons.find(
                            icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                          )?.src)}
                          alt={`${size}x${size} regular icon`} 
                          className="w-16 h-16 object-contain rounded-md"
                        />
                      )}
                      <div className="flex flex-col space-y-1 text-sm">
                        {(() => {
                          const status = getIconStatus(settings.pwa_icons?.find(
                            icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                          ));
                          return (
                            <>
                              <span className={`flex items-center ${status.png ? 'text-green-500' : 'text-gray-400'}`}>
                                {status.png ? '✓' : '○'} PNG
                              </span>
                              <span className={`flex items-center ${status.webp ? 'text-green-500' : 'text-gray-400'}`}>
                                {status.webp ? '✓' : '○'} WebP
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <FileUpload
                      onUploadComplete={(url) => handlePWAIconUpload(url, size, 'any')}
                      accept="image/png"
                      folderPath="sitesettings/pwa"
                      fileName={`icon-${size}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{size}x{size} Maskable Icon</Label>
                    <div className="flex items-center space-x-2">
                      {settings.pwa_icons?.find(
                        icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                      )?.src && (
                        <img 
                          src={addCacheBuster(settings.pwa_icons.find(
                            icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                          )?.src)}
                          alt={`${size}x${size} maskable icon`} 
                          className="w-16 h-16 object-contain rounded-md"
                        />
                      )}
                      <div className="flex flex-col space-y-1 text-sm">
                        {(() => {
                          const status = getIconStatus(settings.pwa_icons?.find(
                            icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                          ));
                          return (
                            <>
                              <span className={`flex items-center ${status.png ? 'text-green-500' : 'text-gray-400'}`}>
                                {status.png ? '✓' : '○'} PNG
                              </span>
                              <span className={`flex items-center ${status.webp ? 'text-green-500' : 'text-gray-400'}`}>
                                {status.webp ? '✓' : '○'} WebP
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <FileUpload
                      onUploadComplete={(url) => handlePWAIconUpload(url, size, 'maskable')}
                      accept="image/png"
                      folderPath="sitesettings/pwa"
                      fileName={`icon-${size}-maskable`}
                    />
                  </div>
                </div>
              ))}
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
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  {settings.og_image && (
                    <img
                      src={`https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/og-image.png`}
                      alt="Open Graph preview"
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="p-4">
                    <FileUpload
                      onUploadComplete={(url) =>
                        setSettings((prev) => ({ ...prev, og_image: url }))
                      }
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
