import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductTable } from "./ProductTable";
import { ProductMobileGrid } from "./ProductMobileGrid";
import { toast } from "sonner";

type Product = Tables<"products">;

interface ProductsListProps {
  searchTerm: string;
  sortBy: string;
  viewMode: "table" | "grid";
  categories?: { id: string; name: string; }[];
}

export function ProductsList({ searchTerm, sortBy, viewMode, categories }: ProductsListProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});

  // Fetch products
  const { data: products, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('ProductsList: Fetching products');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order(sortBy);
      
      if (error) {
        console.error('ProductsList: Error fetching products:', error);
        throw error;
      }
      
      console.log('ProductsList: Products fetched:', data);
      return data || [];
    },
  });

  if (error) {
    toast.error("Failed to load products");
  }

  // Filter products based on search term
  const filteredProducts = products?.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'strain-asc':
        return (a.strain || '').localeCompare(b.strain || '');
      case 'strain-desc':
        return (b.strain || '').localeCompare(a.strain || '');
      case 'price-asc':
        return (a.regular_price || 0) - (b.regular_price || 0);
      case 'price-desc':
        return (b.regular_price || 0) - (a.regular_price || 0);
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return viewMode === "table" ? (
    <ProductTable
      products={sortedProducts}
      editingProduct={editingProduct}
      editValues={editValues}
      categories={categories}
      onEditStart={setEditingProduct}
      onEditSave={() => setEditingProduct(null)}
      onEditCancel={() => setEditingProduct(null)}
      onEditChange={setEditValues}
      onDelete={(id) => console.log('Delete product with id:', id)}
      onImageUpload={(productId, url) => console.log('Upload image for product:', productId, url)}
      onVideoUpload={(productId, url) => console.log('Upload video for product:', productId, url)}
      onDeleteMedia={(productId, type) => console.log('Delete media for product:', productId, type)}
      onMediaClick={(type, url) => console.log('Media clicked:', type, url)}
    />
  ) : (
    <ProductMobileGrid
      products={sortedProducts}
      editingProduct={editingProduct}
      editValues={editValues}
      categories={categories}
      onEditStart={setEditingProduct}
      onEditSave={() => setEditingProduct(null)}
      onEditCancel={() => setEditingProduct(null)}
      onEditChange={setEditValues}
      onDelete={(id) => console.log('Delete product with id:', id)}
      onImageUpload={(productId, url) => console.log('Upload image for product:', productId, url)}
      onVideoUpload={(productId, url) => console.log('Upload video for product:', productId, url)}
      onDeleteMedia={(productId, type) => console.log('Delete media for product:', productId, type)}
      onMediaClick={(type, url) => console.log('Media clicked:', type, url)}
    />
  );
}
