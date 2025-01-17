import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/ProductGrid";
import type { Tables } from "@/integrations/supabase/types";
import { AgeVerification } from "@/components/AgeVerification";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

console.log('Index.tsx: Component loading');

const Index = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showLogo, setShowLogo] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteDescription, setSiteDescription] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data as Tables<"products">["Row"][];
    }
  });

  const filteredProducts = products?.filter(product => 
    selectedCategories.length === 0 || (product.categories && product.categories.some(cat => selectedCategories.includes(cat)))
  );

  useEffect(() => {
    if (isMobile) {
      console.log('Index.tsx: Enabling pull-to-refresh for mobile');
      document.body.style.overscrollBehavior = 'contain';
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.body.style.overscrollBehavior = 'auto';
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile]);

  let touchStartY = 0;
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const scrollTop = window.scrollY;
    
    if (scrollTop <= 0 && touchY > touchStartY) {
      document.body.style.overscrollBehavior = 'auto';
    } else {
      document.body.style.overscrollBehavior = 'contain';
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchY = e.changedTouches[0].clientY;
    const scrollTop = window.scrollY;
    
    if (scrollTop <= 0 && touchY - touchStartY > 100) {
      console.log('Index.tsx: Pull-to-refresh triggered');
      window.location.reload();
      toast({
        description: "Refreshing...",
        duration: 2000,
      });
    }
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleVerification = () => {
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isVerified && <AgeVerification onVerified={handleVerification} />}
      <main className="container">
        {(showLogo || showDescription) && (
          <header className={`text-center mb-8 ${isSticky ? 'mt-36' : 'mt-2'} hidden sm:block`}>
            {showLogo && logoUrl && (
              <img
                src={logoUrl}
                alt="Site Logo"
                className="mx-auto mb-4 max-w-[200px]"
              />
            )}
            {showDescription && siteDescription && (
              <p className="text-lg text-gray-600">{siteDescription}</p>
            )}
          </header>
        )}
        <ProductGrid
          searchTerm=""
          categoryFilter="all"
          sortBy="name-asc"
          viewMode="medium"
        />
      </main>
    </div>
  );
};

export default Index;