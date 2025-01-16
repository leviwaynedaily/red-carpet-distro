import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Header } from "@/components/Header";
import { AgeVerification } from "@/components/AgeVerification";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("storefront_password")
          .single();

        if (error) throw error;
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching storefront password:", error);
        setIsLoading(false);
      }
    };

    checkVerification();

    // Add scroll listener for sticky header
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <Header 
        isSticky={isSticky}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid 
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
}