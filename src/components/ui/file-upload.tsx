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
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className,
  buttonContent = "Upload File"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create the final file path
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName 
        ? `${fileName}.${fileExt}`
        : `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const filePath = folderPath 
        ? `${folderPath}/${finalFileName}`.replace(/\/+/g, '/') // Normalize path
        : finalFileName;

      console.log('Uploading file to path:', filePath);

      // If it's an image, convert to WebP
      let webpBlob: Blob | null = null;
      if (isImageFile(file)) {
        try {
          const { webpBlob: convertedBlob } = await convertToWebP(file);
          webpBlob = convertedBlob;
        } catch (error) {
          console.error('WebP conversion failed:', error);
          // Continue with original file if conversion fails
        }
      }

      // Create form data with both files
      const formData = new FormData();
      formData.append('file', file);
      if (webpBlob) {
        formData.append('webp', webpBlob, `${fileName || file.name.split('.')[0]}.webp`);
      }
      formData.append('productId', folderPath.split('/')[1]); // Assumes folderPath format: 'products/{productId}'

      // Upload via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
      onUploadComplete(data.originalUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
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