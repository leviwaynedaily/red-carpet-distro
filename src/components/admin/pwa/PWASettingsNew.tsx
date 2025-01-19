import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

export function PWASettingsNew() {
  const [isProcessing, setIsProcessing] = useState(false);

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

  const processAndUploadImage = async (file: File) => {
    try {
      setIsProcessing(true);
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

        // Upload files
        const uploads = [
          { blob: regularBlob, path: `pwa/icon-${size}-any.png` },
          { blob: maskableBlob, path: `pwa/icon-${size}-maskable.png` },
          { blob: regularWebPBlob, path: `pwa/icon-${size}-any.webp` },
          { blob: maskableWebPBlob, path: `pwa/icon-${size}-maskable.webp` }
        ];

        for (const { blob, path } of uploads) {
          const { error } = await supabase.storage
            .from('media')
            .upload(path, blob, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) {
            console.error(`Error uploading ${path}:`, error);
            throw error;
          }
        }

        console.log(`Successfully processed and uploaded size ${size}x${size}`);
      }

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
    </div>
  );
}