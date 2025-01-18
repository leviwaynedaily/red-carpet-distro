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
  buttonContent?: React.ReactNode;
  productName?: string; // Added this prop
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className,
  buttonContent = "Upload File",
  productName = "image" // Default to "image" if no product name provided
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
        bucket,
        productName
      });
      
      // Create sanitized product name for file naming
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Create the final file path
      const fileExt = file.name.split('.').pop();
      const finalFileName = `${sanitizedName}.${fileExt}`;
      
      const filePath = folderPath 
        ? `${folderPath}/${finalFileName}`.replace(/\/+/g, '/') 
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
          const webpPath = `${folderPath}/${sanitizedName}.webp`;

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
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload file');
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
          buttonContent
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