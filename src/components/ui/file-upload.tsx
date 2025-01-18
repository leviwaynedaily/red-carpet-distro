import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  bucket?: string;
  folderPath?: string;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FileUpload({ 
  onUploadComplete,
  accept = "image/*",
  bucket = "media",
  folderPath = "",
  fileName,
  className,
  children
}: FileUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const finalFileName = fileName || file.name;
      const filePath = folderPath ? `${folderPath}/${finalFileName}` : finalFileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = (e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>);
        input.click();
      }}
    >
      {children || "Upload File"}
    </Button>
  );
}