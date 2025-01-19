import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // Fetch products with their categories
  const { data: products, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('ProductsList: Fetching products');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) {
        console.error('ProductsList: Error fetching products:', productsError);
        throw productsError;
      }

      // Fetch categories for each product
      const productsWithCategories = await Promise.all(productsData.map(async (product) => {
        const { data: categoryData, error: categoryError } = await supabase
          .from('product_categories')
          .select('categories(name)')
          .eq('product_id', product.id);

        if (categoryError) {
          console.error('ProductsList: Error fetching categories for product:', categoryError);
          return product;
        }

        const categories = categoryData.map(pc => pc.categories?.name).filter(Boolean) as string[];
        return { ...product, categories };
      }));
      
      console.log('ProductsList: Products fetched with categories:', productsWithCategories);
      return productsWithCategories || [];
    },
  });

  if (error) {
    toast.error("Failed to load products");
  }

  // Filter products based on search term
  const filteredProducts = products?.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleEditSave = async () => {
    console.log('ProductsList: Saving edit for product:', editingProduct);
    try {
      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update(editValues)
        .eq('id', editingProduct);

      if (updateError) throw updateError;

      // Invalidate the products query to refetch the data
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('ProductsList: Error saving product:', error);
      toast.error('Failed to update product');
    }
  };

  return (
    <ProductTable
      products={filteredProducts}
      visibleColumns={visibleColumns}
      editingProduct={editingProduct}
      editValues={editValues}
      categories={categories}
      onEditStart={(product) => {
        console.log('ProductsList: Starting edit for product:', product);
        setEditingProduct(product.id);
        setEditValues(product);
      }}
      onEditSave={handleEditSave}
      onEditCancel={() => {
        console.log('ProductsList: Canceling edit');
        setEditingProduct(null);
      }}
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