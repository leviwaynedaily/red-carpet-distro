import React from 'react';
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconStatus } from "./IconStatus";
import type { PWAIcon } from "@/types/site-settings";

const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

interface PWAManualUploadProps {
  icons: PWAIcon[];
  onIconUpload: (url: string, size: number) => void;
}

export function PWAManualUpload({ icons, onIconUpload }: PWAManualUploadProps) {
  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-8">
        {PWA_SIZES.map(size => {
          const sizeIcons = icons?.filter(icon => icon.sizes === `${size}x${size}`) || [];
          const regularIcon = sizeIcons.find(icon => icon.purpose === 'any');
          const maskableIcon = sizeIcons.find(icon => icon.purpose === 'maskable');

          return (
            <div key={size} className="space-y-4">
              <h4 className="font-medium text-lg border-b pb-2">{size}x{size}</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium">Regular Icon</h5>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-white rounded-lg border p-2 flex items-center justify-center">
                      {regularIcon && (
                        <img 
                          src={regularIcon.src} 
                          alt={`${size}x${size} regular`}
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <FileUpload
                        onUploadComplete={(url) => onIconUpload(url, size)}
                        accept="image/png"
                        folderPath={`pwa/icons`}
                        fileName={`icon-${size}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="font-medium">Maskable Icon</h5>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-white rounded-lg border p-2 flex items-center justify-center">
                      {maskableIcon && (
                        <img 
                          src={maskableIcon.src} 
                          alt={`${size}x${size} maskable`}
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <FileUpload
                        onUploadComplete={(url) => onIconUpload(url, size)}
                        accept="image/png"
                        folderPath={`pwa/icons`}
                        fileName={`icon-${size}-maskable`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}