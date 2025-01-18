import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { IconStatus } from './IconStatus';
import { Check, X } from 'lucide-react';
import { PWAIcon } from '@/types/site-settings';

interface PWAIconsProps {
  icons: PWAIcon[];
  onIconUpload: (url: string, size: number, purpose: 'any' | 'maskable') => void;
  sizes: number[];
}

interface IconDimensions {
  width: number;
  height: number;
}

export const PWAIcons: React.FC<PWAIconsProps> = ({ icons, onIconUpload, sizes }) => {
  const [iconDimensions, setIconDimensions] = useState<Record<string, IconDimensions>>({});

  const getIconStatus = (icon: PWAIcon | undefined) => {
    if (!icon) return { png: false, webp: false };
    return {
      png: !!icon.src,
      webp: !!icon.webp
    };
  };

  const getImageDimensions = (url: string): Promise<IconDimensions> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const loadDimensions = async () => {
      const dimensions: Record<string, IconDimensions> = {};
      
      for (const icon of icons) {
        if (icon.src) {
          try {
            dimensions[`${icon.sizes}-${icon.purpose}`] = await getImageDimensions(icon.src);
          } catch (error) {
            console.error('Error loading dimensions for icon:', error);
          }
        }
      }
      
      setIconDimensions(dimensions);
    };

    loadDimensions();
  }, [icons]);

  const addCacheBuster = (url: string | null) => {
    if (!url) return '';
    return `${url}?t=${Date.now()}`;
  };

  const isDimensionsValid = (size: number, dimensions: IconDimensions | undefined) => {
    if (!dimensions) return false;
    return dimensions.width === size && dimensions.height === size;
  };

  const renderDimensionsStatus = (size: number, purpose: 'any' | 'maskable') => {
    const icon = icons.find(
      icon => icon.sizes === `${size}x${size}` && icon.purpose === purpose
    );
    
    if (!icon?.src) return null;

    const dimensions = iconDimensions[`${size}x${size}-${purpose}`];
    if (!dimensions) return null;

    const isValid = isDimensionsValid(size, dimensions);

    return (
      <div className="flex items-center gap-2 mt-1 text-sm">
        <span>
          Current size: {dimensions.width}x{dimensions.height}
        </span>
        {isValid ? (
          <Check className="text-green-500 h-4 w-4" />
        ) : (
          <X className="text-red-500 h-4 w-4" />
        )}
      </div>
    );
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
                <div className="space-y-2">
                  <img 
                    src={addCacheBuster(icons.find(
                      icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'
                    )?.src || '')}
                    alt={`${size}x${size} regular icon`} 
                    className="w-16 h-16 object-contain rounded-md"
                  />
                  {renderDimensionsStatus(size, 'any')}
                </div>
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
                <div className="space-y-2">
                  <img 
                    src={addCacheBuster(icons.find(
                      icon => icon.sizes === `${size}x${size}` && icon.purpose === 'maskable'
                    )?.src || '')}
                    alt={`${size}x${size} maskable icon`} 
                    className="w-16 h-16 object-contain rounded-md"
                  />
                  {renderDimensionsStatus(size, 'maskable')}
                </div>
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