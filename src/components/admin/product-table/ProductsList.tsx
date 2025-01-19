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
  visibleColumns: string[];
  categories?: { id: string; name: string; }[];
}

export function ProductsList({ searchTerm, visibleColumns, categories }: ProductsListProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});

  // Fetch products
  const { data: products, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('ProductsList: Fetching products');
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
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

  return (
    <ProductTable
      products={filteredProducts}
      visibleColumns={visibleColumns}
      editingProduct={editingProduct}
      editValues={editValues}
      categories={categories}
      onEditStart={(product) => {
        setEditingProduct(product.id);
        setEditValues(product);
      }}
      onEditSave={() => setEditingProduct(null)}
      onEditCancel={() => setEditingProduct(null)}
      onEditChange={setEditValues}
      onDelete={(id) => console.log('Delete product with id:', id)}
      onImageUpload={(productId, url) => console.log('Upload image for product:', productId, url)}
      onVideoUpload={(productId, url) => console.log('Upload video for product:', productId, url)}
      onDeleteMedia={(productId, type) => console.log('Delete media for product:', productId, type)}
      onMediaClick={(type, url) => console.log('Media clicked:', type, url)}
      sortConfig={{ key: "name", direction: "asc" }}
      onSort={(key) => console.log('Sort by:', key)}
    />
  );
}