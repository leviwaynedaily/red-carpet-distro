import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/ProductGrid";
import type { Database } from "@/integrations/supabase/types";
import { AgeVerification } from "@/components/AgeVerification";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";

console.log('Index.tsx: Component loading');

const Index = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<'small' | 'medium' | 'large'>('medium');
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data as Database['public']['Tables']['products']['Row'][];
    }
  });

  // Set small grid by default for mobile
  useEffect(() => {
    if (isMobile) {
      console.log('Index.tsx: Setting small grid for mobile view');
      setViewMode('small');
    }
  }, [isMobile]);

  // Handle scroll position when entering mobile view
  useEffect(() => {
    if (isMobile) {
      console.log('Index.tsx: Scrolling to top for mobile view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleVerification = () => {
    setIsVerified(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleViewModeChange = (mode: 'small' | 'medium' | 'large') => {
    setViewMode(mode);
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVerified) {
    return <AgeVerification onVerified={handleVerification} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isSticky={isSticky}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onLogoClick={handleLogoClick}
      />
      <main className="container pt-4">
        <ProductGrid
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
};

export default Index;