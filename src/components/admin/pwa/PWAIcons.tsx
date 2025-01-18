import React from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
import { PWAIcon } from '@/types/site-settings';

interface PWAIconsProps {
  icons: PWAIcon[];
  onIconUpload: (url: string, size: number, purpose: 'any' | 'maskable') => void;
  sizes: number[];
}

export const PWAIcons: React.FC<PWAIconsProps> = ({ icons, onIconUpload, sizes }) => {
  const getIconStatus = (icon: PWAIcon | undefined) => {
    if (!icon) return { png: false, webp: false };
    return {
      png: !!icon.src,
      webp: !!icon.webp
    };
  };

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sizes.map((size) => (
        <div key={size} className="space-y-4">
          <div className="space-y-2">
            <Label>{size}x{size} Regular Icon</Label>
            <div className="flex items-center space-x-2">
              {icons?.find(
                icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
              )?.src && (
                <img 
                  src={addCacheBuster(icons.find(
                    icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                  )?.src || '')}
                  alt={`${size}x${size} regular icon`} 
                  className="w-16 h-16 object-contain rounded-md"
                />
              )}
              <IconStatus 
                status={getIconStatus(icons?.find(
                  icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                ))}
              />
            </div>
            <FileUpload
              onUploadComplete={(url) => onIconUpload(url, size, 'any')}
              accept="image/png"
              folderPath="sitesettings/pwa"
              fileName={`icon-${size}`}
            />
          </div>

          <div className="space-y-2">
            <Label>{size}x{size} Maskable Icon</Label>
            <div className="flex items-center space-x-2">
              {icons?.find(
                icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
              )?.src && (
                <img 
                  src={addCacheBuster(icons.find(
                    icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                  )?.src || '')}
                  alt={`${size}x${size} maskable icon`} 
                  className="w-16 h-16 object-contain rounded-md"
                />
              )}
              <IconStatus 
                status={getIconStatus(icons?.find(
                  icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                ))}
              />
            </div>
            <FileUpload
              onUploadComplete={(url) => onIconUpload(url, size, 'maskable')}
              accept="image/png"
              folderPath="sitesettings/pwa"
              fileName={`icon-${size}-maskable`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};