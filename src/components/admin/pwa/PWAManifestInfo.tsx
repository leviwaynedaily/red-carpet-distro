import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export function PWAManifestInfo() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Manifest Configuration</h3>
        <p className="text-sm text-muted-foreground">
          The manifest.json file is stored in Supabase Storage and referenced in index.html
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Index.html Reference</h4>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <pre className="text-sm">
              {`<!DOCTYPE html>
<html lang="en">
  <head>
    ...
    <link rel="manifest" href="https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/manifest.json">
    ...
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`}
            </pre>
          </ScrollArea>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Current Manifest Location</h4>
          <p className="text-sm mb-2">The manifest file is stored at:</p>
          <code className="bg-muted p-2 rounded-md block text-sm">
            https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/manifest.json
          </code>
        </Card>
      </div>
    </div>
  );
}