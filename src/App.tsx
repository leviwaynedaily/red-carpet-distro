import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/Admin";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

console.log('App.tsx: Initializing App component');

const queryClient = new QueryClient();

const App = () => {
  console.log('App.tsx: Rendering App component');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installationError, setInstallationError] = useState<string | null>(null);

  useEffect(() => {
    const checkInstallability = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isPWA = window.navigator.standalone || isStandalone;
      const isSecure = window.location.protocol === 'https:';
      
      console.log('App.tsx: Checking PWA installability:', {
        isPWA,
        isSecure,
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        vendor: window.navigator.vendor,
        standalone: window.navigator.standalone,
        displayMode: isStandalone
      });

      return !isPWA && isSecure;
    };

    if (checkInstallability()) {
      console.log('App.tsx: App is installable');
    } else {
      console.log('App.tsx: App is not installable:', {
        reason: window.matchMedia('(display-mode: standalone)').matches ? 'Already installed' : 'Not meeting criteria'
      });
      setInstallationError('App is either already installed or not meeting installation criteria');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('App.tsx: Received beforeinstallprompt event', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Show the install prompt immediately
      setShowInstallPrompt(true);
      
      // Log detailed platform information
      console.log('App.tsx: Installation environment:', {
        platform: window.navigator.platform,
        userAgent: window.navigator.userAgent,
        vendor: window.navigator.vendor,
        language: window.navigator.language,
        onLine: window.navigator.onLine,
        cookieEnabled: window.navigator.cookieEnabled,
        serviceWorker: 'serviceWorker' in navigator
      });
    };

    const handleAppInstalled = (e: Event) => {
      console.log('App.tsx: App was installed', e);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstallable(false);
      toast({
        title: "Installation Complete",
        description: "The app has been successfully installed!",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Log initial PWA status
    console.log('App.tsx: Initial PWA Status:', {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      isInstallable,
      navigator: window.navigator,
      platform: window.navigator.platform,
      serviceWorkerSupport: 'serviceWorker' in navigator,
      error: installationError
    });

    // Check if service worker is supported and registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('App.tsx: Service Worker is ready:', registration);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('App.tsx: Service Worker controller changed');
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('App.tsx: Received message from Service Worker:', event.data);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstallable, installationError]);

  const handleClosePrompt = () => {
    console.log('App.tsx: Closing install prompt');
    setShowInstallPrompt(false);
  };

  const handleInstallClick = async () => {
    console.log('App.tsx: Custom install button clicked');
    if (deferredPrompt) {
      try {
        console.log('App.tsx: Showing install prompt');
        // Show the install prompt
        await deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log('App.tsx: User choice result:', choiceResult);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('App.tsx: User accepted the install prompt');
          toast({
            title: "Installing App",
            description: "The app is being installed...",
          });
        } else {
          console.log('App.tsx: User declined the install prompt');
          toast({
            title: "Installation Cancelled",
            description: "You can install the app later from the button below.",
            variant: "destructive",
          });
        }
        // Clear the deferredPrompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error('App.tsx: Error showing install prompt:', error);
        setInstallationError(error instanceof Error ? error.message : 'Unknown installation error');
        toast({
          title: "Installation Error",
          description: "There was an error installing the app. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.log('App.tsx: No deferred prompt available');
      setInstallationError('Installation prompt not available');
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
        {showInstallPrompt && deferredPrompt && (
          <PWAInstallPrompt
            deferredPrompt={deferredPrompt}
            onClose={handleClosePrompt}
          />
        )}
        {deferredPrompt && !showInstallPrompt && (
          <Button
            onClick={handleInstallClick}
            className="fixed bottom-4 right-4 z-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        )}
        {installationError && (
          <div className="fixed bottom-4 left-4 text-sm text-red-500">
            {installationError}
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;