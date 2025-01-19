import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PWAManifestInfo() {
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [manifestContent, setManifestContent] = useState<string>('');

  useEffect(() => {
    fetchManifestInfo();
  }, []);

  const fetchManifestInfo = async () => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('static')
        .getPublicUrl('manifest.json');

      setManifestUrl(publicUrl);

      const response = await fetch(publicUrl);
      const content = await response.json();
      setManifestContent(JSON.stringify(content, null, 2));
    } catch (error) {
      console.error('Error fetching manifest info:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          The manifest.json file is stored in the static bucket and referenced in index.html.
          Current manifest URL: <code className="bg-muted px-1 rounded">{manifestUrl}</code>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <h4 className="font-medium">Manifest Content:</h4>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <pre className="text-sm">
            {manifestContent}
          </pre>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Index.html Reference:</h4>
        <ScrollArea className="h-[100px] w-full rounded-md border p-4">
          <pre className="text-sm">
{`<link rel="manifest" href="${manifestUrl}">`}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
}