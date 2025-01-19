import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PWAScreenshots } from "./PWAScreenshots";
import { PWAManualUpload } from "./PWAManualUpload";
import { PWAAutoGenerate } from "./PWAAutoGenerate";

interface PWASettingsProps {
  settings: any;
  onSettingChange: (name: string, value: any) => void;
}

export function PWASettings({ settings, onSettingChange }: PWASettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">PWA Screenshots</h3>
        <PWAScreenshots
          desktopScreenshot={settings.pwa_desktop_screenshot || null}
          mobileScreenshot={settings.pwa_mobile_screenshot || null}
          onDesktopUpload={(url) => onSettingChange('pwa_desktop_screenshot', url)}
          onMobileUpload={(url) => onSettingChange('pwa_mobile_screenshot', url)}
        />

        <h3 className="text-lg font-medium mt-6">PWA Icons</h3>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList>
            <TabsTrigger value="manual">Manual Upload</TabsTrigger>
            <TabsTrigger value="auto">Auto Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <PWAManualUpload
              icons={settings.pwa_icons}
              onIconUpload={(url, size) => {
                const updatedIcons = [...(settings.pwa_icons || [])];
                const existingIconIndex = updatedIcons.findIndex(
                  (icon) => icon.sizes === `${size}x${size}`
                );
                
                if (existingIconIndex !== -1) {
                  updatedIcons[existingIconIndex] = {
                    ...updatedIcons[existingIconIndex],
                    src: url,
                  };
                } else {
                  updatedIcons.push({
                    src: url,
                    sizes: `${size}x${size}`,
                    type: 'image/png',
                    purpose: 'any'
                  });
                }
                
                onSettingChange('pwa_icons', updatedIcons);
              }}
            />
          </TabsContent>

          <TabsContent value="auto" className="mt-4">
            <PWAAutoGenerate
              onIconsGenerated={(icons) => {
                onSettingChange('pwa_icons', icons);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}