import { useState, useEffect } from "react";
import { AgeVerification } from "@/components/AgeVerification";
import { ProductGrid } from "@/components/ProductGrid";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

console.log('Index.tsx: Loading Index component');

const Index = () => {
  console.log('Index.tsx: Initializing Index component');

  const [isVerified, setIsVerified] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [viewMode, setViewMode] = useState<'small' | 'medium' | 'large'>('small');
  const [logoUrl, setLogoUrl] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [siteDescription, setSiteDescription] = useState("");

  useEffect(() => {
    const fetchSiteSettings = async () => {
      console.log('Index.tsx: Fetching site settings');
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url, show_site_logo, show_site_description, site_description')
        .single();
      
      if (!error && data) {
        const logoUrlWithCache = data.logo_url ? `${data.logo_url}?t=${Date.now()}` : "";
        console.log('Index.tsx: Site settings fetched:', data);
        setLogoUrl(logoUrlWithCache);
        setShowLogo(data.show_site_logo);
        setShowDescription(data.show_site_description);
        setSiteDescription(data.site_description);
      } else if (error) {
        console.error('Index.tsx: Error fetching site settings:', error);
      }
    };
    
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    console.log('Index.tsx: Setting up scroll listener');
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleVerification = () => {
    console.log('Index.tsx: User verified age');
    setIsVerified(true);
  };

  const handleLogoClick = () => {
    console.log('Index.tsx: Logo clicked, resetting verification');
    setIsVerified(false);
  };

  console.log('Index.tsx: Rendering Index component', { isVerified, isSticky, showLogo, showDescription });

  return (
    <div className="min-h-screen bg-gray-50">
      {!isVerified && <AgeVerification onVerified={handleVerification} />}
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
        onLogoClick={handleLogoClick}
      />
      <main className="container py-4">
        {(showLogo || showDescription) && (
          <header className={`text-center mb-8 ${isSticky ? 'mt-32' : 'mt-4'} hidden sm:block`}>
            {showLogo && logoUrl && (
              <img
                src={logoUrl}
                alt="Palmtree Smokes"
                className="w-64 mx-auto mb-6 cursor-pointer"
                onClick={handleLogoClick}
              />
            )}
            {showDescription && (
              <p className="text-gray-600 max-w-2xl mx-auto">
                {siteDescription}
              </p>
            )}
          </header>
        )}
        <ProductGrid
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      </main>
      <footer className="bg-white border-t mt-12 py-8">
        <div className="container text-center text-sm text-gray-600">
          <p>© 2024 Palmtree Smokes. Must be 21 or older.</p>
          <p className="mt-2">
            This product has intoxicating effects and may be habit forming.
            Marijuana can impair concentration, coordination, and judgment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;