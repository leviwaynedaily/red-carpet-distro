import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { convertToWebP, isImageFile } from "@/utils/imageUtils";

interface FileUploadProps {
  onUploadComplete: (file: File) => void;
  accept?: string;
  bucket?: string;
  folderPath?: string;
  fileName?: string;
  className?: string;
  buttonContent?: React.ReactNode;
  productName?: string;
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className,
  buttonContent = "Upload File",
  productName = "image"
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

      onUploadComplete(file);
      
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