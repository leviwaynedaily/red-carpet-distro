import { useState } from "react";
import { ProductTableFilters } from "./ProductTableFilters";
import { ProductsList } from "./product-table/ProductsList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('ProductManagement: Fetching categories');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('ProductManagement: Error fetching categories:', error);
        throw error;
      }
      
      console.log('ProductManagement: Categories fetched:', data);
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <ProductTableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <ProductsList
        searchTerm={searchTerm}
        sortBy={sortBy}
        viewMode={viewMode}
        categories={categories}
      />
    </div>
  );
}