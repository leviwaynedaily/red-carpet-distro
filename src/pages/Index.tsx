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

  useEffect(() => {
    if (isMobile) {
      console.log('Index.tsx: Setting small grid for mobile view');
      setViewMode('small');
    }
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    const container = document.getElementById('root');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Prevent default touch behavior
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener('touchmove', preventPullToRefresh, { passive: false });
    return () => {
      document.body.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

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
    const container = document.getElementById('root');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
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