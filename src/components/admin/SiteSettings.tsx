import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { convertToWebP } from "@/utils/imageUtils";

interface FileInfo {
  type: string;
  size: number;
  url: string;
}

interface MediaInfo {
  original?: FileInfo;
  webp?: FileInfo;
}

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

export function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
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
      </div>
    </div>
  );
}