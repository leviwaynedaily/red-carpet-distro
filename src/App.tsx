import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";

function App() {
  console.log('App.tsx: Initializing App component');

  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('favicon_webp_url, favicon_png_url, favicon_url')
          .single();

        if (settings) {
          // Update favicon links
          const links = document.getElementsByTagName('link');
          for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.rel === 'icon') {
              if (link.type === 'image/webp' && settings.favicon_webp_url) {
                console.log('App.tsx: Setting WebP favicon:', settings.favicon_webp_url);
                link.href = settings.favicon_webp_url;
              } else if (link.type === 'image/png' && settings.favicon_png_url) {
                console.log('App.tsx: Setting PNG favicon:', settings.favicon_png_url);
                link.href = settings.favicon_png_url;
              } else if (link.type === 'image/x-icon' && settings.favicon_url) {
                console.log('App.tsx: Setting ICO favicon:', settings.favicon_url);
                link.href = settings.favicon_url;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating favicon:', error);
      }
    };

    updateFavicon();
  }, []);

  console.log('App.tsx: Rendering App component');
  
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;