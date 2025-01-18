import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { convertToWebP, isImageFile } from "@/utils/imageUtils";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  bucket?: string;
  folderPath?: string;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;  // Added children prop
  onClientUploadComplete?: (res: any) => void;  // Added for compatibility
  onUploadError?: (error: Error) => void;  // Added for compatibility
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className,
  children,
  onClientUploadComplete,
  onUploadError
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log('🚀 Starting file upload process:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folderPath,
        bucket
      });
      
      // Create the final file path
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName 
        ? `${fileName}.${fileExt}`
        : `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const filePath = folderPath 
        ? `${folderPath}/${finalFileName}`.replace(/\/+/g, '/') // Normalize path
        : finalFileName;

      console.log('📁 Uploading file to path:', filePath);

      // First upload the original file directly to storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error uploading original file:', uploadError);
        throw uploadError;
      }

      console.log('✅ Original file uploaded successfully:', data);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('🔗 File public URL:', publicUrl);

      // If it's an image, handle WebP conversion
      if (isImageFile(file)) {
        try {
          console.log('🔄 Starting WebP conversion');
          const { webpBlob } = await convertToWebP(file);
          const webpPath = `${folderPath}/${fileName || file.name.split('.')[0]}.webp`;

          console.log('📤 Uploading WebP version to:', webpPath);

          // Upload WebP version
          const { error: webpError } = await supabase.storage
            .from(bucket)
            .upload(webpPath, webpBlob, {
              contentType: 'image/webp',
              cacheControl: '3600',
              upsert: true
            });

          if (webpError) {
            console.error('⚠️ WebP upload error:', webpError);
            // Don't throw, continue with original file
          } else {
            console.log('✅ WebP version uploaded successfully');
          }
        } catch (webpError) {
          console.error('⚠️ WebP conversion failed:', webpError);
          // Continue with original file if WebP conversion fails
        }
      }

      onUploadComplete(publicUrl);
      if (onClientUploadComplete) {
        onClientUploadComplete([{ url: publicUrl }]);
      }
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload file');
      if (onUploadError) {
        onUploadError(error as Error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        className="relative"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          children || "Upload File"
        )}
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept={accept}
          disabled={isUploading}
        />
      </Button>
    </div>
  );
}