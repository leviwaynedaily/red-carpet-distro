import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  bucket?: string;
  folderPath?: string;
  fileName?: string;
  className?: string;
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className 
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
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true // Enable overwriting
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('File uploaded successfully, public URL:', publicUrl);
      onUploadComplete(publicUrl);
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
          'Upload File'
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