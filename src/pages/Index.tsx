import { useState, useEffect } from "react";
import { AgeVerification } from "@/components/AgeVerification";
import { ProductGrid } from "@/components/ProductGrid";

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is already verified
  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    if (verified === "true") {
      setIsVerified(true);
    }
  }, []);

  const handleVerification = () => {
    localStorage.setItem("age-verified", "true");
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isVerified && <AgeVerification onVerified={handleVerification} />}
      <main className="container py-8">
        <header className="text-center mb-12">
          <img
            src="/lovable-uploads/edfd3dc9-231d-4b8e-be61-2d59fa6acac4.png"
            alt="Palmtree Smokes"
            className="w-64 mx-auto mb-8"
          />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome to Palmtree Smokes, your premium destination for quality cannabis products.
            Browse our carefully curated selection below.
          </p>
        </header>
        <ProductGrid />
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