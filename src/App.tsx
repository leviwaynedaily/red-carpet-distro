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

console.log('App.tsx: Initializing App component');

const queryClient = new QueryClient();

const App = () => {
  console.log('App.tsx: Rendering App component');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('App.tsx: Received beforeinstallprompt event');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClosePrompt = () => {
    console.log('App.tsx: Closing install prompt');
    setShowInstallPrompt(false);
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
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;