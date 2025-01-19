import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

interface GeneratedFile {
  size: number;
  type: 'any' | 'maskable';
  format: 'png' | 'webp';
  url: string;
  dimensions: string;
}

export function PWASettingsNew() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const createMaskableVersion = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, size: number) => {
    // Create a new canvas for the maskable icon
    const maskableCanvas = document.createElement('canvas');
    const maskableCtx = maskableCanvas.getContext('2d');
    if (!maskableCtx) return null;

    // Set canvas size
    maskableCanvas.width = size;
    maskableCanvas.height = size;

    // Calculate padding (10% on each side)
    const padding = size * 0.1;
    const imageSize = size - (padding * 2);

    // Draw white background
    maskableCtx.fillStyle = 'white';
    maskableCtx.fillRect(0, 0, size, size);

    // Draw the original image with padding
    maskableCtx.drawImage(canvas, padding, padding, imageSize, imageSize);

    return maskableCanvas;
  };

  const uploadToEdgeFunction = async (blob: Blob, size: number, type: 'any' | 'maskable', format: 'png' | 'webp') => {
    console.log(`Uploading ${format} file for size ${size}x${size} (${type})`);
    
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('size', size.toString());
    formData.append('type', type);
    formData.append('format', format);

    const { data, error } = await supabase.functions.invoke('upload-pwa-icons', {
      body: formData,
    });

    if (error) {
      console.error('Error uploading to edge function:', error);
      throw error;
    }

    console.log('Upload successful:', data);
    return data.path;
  };

  const processAndUploadImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setGeneratedFiles([]);
      console.log('Starting image processing...');

      // Create source canvas
      const sourceCanvas = document.createElement('canvas');
      const sourceCtx = sourceCanvas.getContext('2d');
      if (!sourceCtx) {
        throw new Error('Could not get canvas context');
      }

      // Load image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      const newGeneratedFiles: GeneratedFile[] = [];

      // Process each size
      for (const size of PWA_SIZES) {
        console.log(`Processing size: ${size}x${size}`);

        // Set canvas size
        sourceCanvas.width = size;
        sourceCanvas.height = size;

        // Clear canvas and draw resized image
        sourceCtx.clearRect(0, 0, size, size);
        sourceCtx.drawImage(img, 0, 0, size, size);

        // Create maskable version
        const maskableCanvas = createMaskableVersion(sourceCanvas, sourceCtx, size);
        if (!maskableCanvas) continue;

        // Convert and upload PNG versions
        const regularBlob = await new Promise<Blob>(resolve => 
          sourceCanvas.toBlob(blob => resolve(blob!), 'image/png')
        );
        const maskableBlob = await new Promise<Blob>(resolve => 
          maskableCanvas.toBlob(blob => resolve(blob!), 'image/png')
        );

        // Convert and upload WebP versions
        const regularWebPBlob = await new Promise<Blob>(resolve => 
          sourceCanvas.toBlob(blob => resolve(blob!), 'image/webp')
        );
        const maskableWebPBlob = await new Promise<Blob>(resolve => 
          maskableCanvas.toBlob(blob => resolve(blob!), 'image/webp')
        );

        // Upload files using Edge Function
        const uploads = [
          { blob: regularBlob, type: 'any' as const, format: 'png' as const },
          { blob: maskableBlob, type: 'maskable' as const, format: 'png' as const },
          { blob: regularWebPBlob, type: 'any' as const, format: 'webp' as const },
          { blob: maskableWebPBlob, type: 'maskable' as const, format: 'webp' as const }
        ];

        for (const { blob, type, format } of uploads) {
          try {
            const path = await uploadToEdgeFunction(blob, size, type, format);
            
            newGeneratedFiles.push({
              size: Math.round(blob.size / 1024), // Convert to KB
              type,
              format,
              url: path,
              dimensions: `${size}x${size}`
            });
            
            console.log(`Successfully uploaded ${format} ${type} icon for size ${size}`);
          } catch (uploadError) {
            console.error(`Error uploading ${format} ${type} icon for size ${size}:`, uploadError);
            toast.error(`Failed to upload ${size}x${size} ${type} ${format} icon`);
          }
        }
      }

      setGeneratedFiles(newGeneratedFiles);
      toast.success('All PWA icons generated and uploaded successfully');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process and upload PWA icons');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Single PWA Icon (512x512 PNG)</Label>
        <p className="text-sm text-muted-foreground">
          Upload a single 512x512 PNG image and we'll automatically generate all required sizes and formats
        </p>
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing and uploading icons...</span>
          </div>
        ) : (
          <FileUpload
            onUploadComplete={(url) => {
              fetch(url)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], 'icon.png', { type: 'image/png' });
                  processAndUploadImage(file);
                })
                .catch(error => {
                  console.error('Error fetching uploaded file:', error);
                  toast.error('Failed to process uploaded file');
                });
            }}
            accept="image/png"
            folderPath="pwa"
            fileName="original"
          />
        )}
      </div>

      {generatedFiles.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Generated Files</h3>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {PWA_SIZES.map(size => (
                <div key={size} className="space-y-2">
                  <h4 className="font-medium">{size}x{size}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedFiles
                      .filter(file => file.dimensions === `${size}x${size}`)
                      .map((file, index) => (
                        <div key={index} className="flex items-center space-x-4 p-2 bg-muted rounded-lg">
                          <img 
                            src={file.url} 
                            alt={`${file.dimensions} ${file.type} ${file.format}`}
                            className="w-12 h-12 object-contain bg-white rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {file.type} ({file.format})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {file.size}KB
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
