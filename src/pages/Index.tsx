import { useState, useEffect } from "react";
import { AgeVerification } from "@/components/AgeVerification";
import { ProductGrid } from "@/components/ProductGrid";
import { Header } from "@/components/Header";

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [viewMode, setViewMode] = useState<'small' | 'medium' | 'large'>('small');

  // Check if user is already verified
  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    if (verified === "true") {
      setIsVerified(true);
    }
  }, []);

  // Handle sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleVerification = () => {
    localStorage.setItem("age-verified", "true");
    setIsVerified(true);
  };

  const handleLogoClick = () => {
    localStorage.removeItem("age-verified");
    setIsVerified(false);
  };

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
      />
      <main className="container py-8">
        <header className={`text-center mb-12 ${isSticky ? 'mt-32' : ''}`}>
          <img
            src="/lovable-uploads/edfd3dc9-231d-4b8e-be61-2d59fa6acac4.png"
            alt="Palmtree Smokes"
            className="w-64 mx-auto mb-8 cursor-pointer"
            onClick={handleLogoClick}
          />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome to Palmtree Smokes, your premium destination for quality cannabis products.
            Browse our carefully curated selection below.
          </p>
        </header>
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
