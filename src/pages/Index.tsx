import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/ProductGrid";
import type { Database } from "@/integrations/supabase/types";
import { AgeVerification } from "@/components/AgeVerification";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem('isAgeVerified') === 'true';
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
        isSticky={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onLogoClick={handleLogoClick}
      />
      <main className="container mx-auto px-4 pt-[calc(theme(spacing.40)+theme(spacing.24))] md:pt-[calc(theme(spacing.48)+theme(spacing.24))]">
        <ProductGrid
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
        />
      </main>
    </div>
  );
};

export default Index;