import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Header } from "@/components/Header";
import { AgeVerification } from "@/components/AgeVerification";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storefrontPassword, setStorefrontPassword] = useState("");

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("storefront_password")
          .single();

        if (error) throw error;
        
        if (data?.storefront_password) {
          setStorefrontPassword(data.storefront_password);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching storefront password:", error);
        setIsLoading(false);
      }
    };

    checkVerification();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isVerified && <AgeVerification onVerified={() => setIsVerified(true)} />}
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
    </div>
  );
}