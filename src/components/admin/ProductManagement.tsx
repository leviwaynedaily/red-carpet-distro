import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductTable } from "./ProductTable";
import { ProductTableFilters } from "./ProductTableFilters";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductMobileGrid } from "./product-table/ProductMobileGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Product = Tables<"products">;

export function ProductManagement() {
  const { data: products, isLoading, error } = useProducts();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "strain",
    "description",
    "image",
    "video_url",
    "categories",
    "stock",
    "regular_price",
    "shipping_price",
  ]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "strain", label: "Strain" },
    { key: "description", label: "Description" },
    { key: "image", label: "Image" },
    { key: "video_url", label: "Video" },
    { key: "categories", label: "Categories" },
    { key: "stock", label: "Stock" },
    { key: "regular_price", label: "Price" },
    { key: "shipping_price", label: "Shipping" },
  ];

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(current =>
      current.includes(columnKey)
        ? current.filter(key => key !== columnKey)
        : [...current, columnKey]
    );
  };

  const handleEditStart = async (product: Product & { categories?: string[] }) => {
    console.log('ProductManagement: Starting edit for product:', product.id);
    setEditingProduct(product.id);
    setEditValues({
      ...product,
      categories: product.categories || [],
    });
  };

  const handleEditSave = async () => {
    console.log('ProductManagement: Saving product:', editingProduct);
    try {
      if (!editingProduct) return;

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: editValues.name,
          description: editValues.description,
          strain: editValues.strain,
          stock: editValues.stock,
          regular_price: editValues.regular_price,
          shipping_price: editValues.shipping_price,
        })
        .eq('id', editingProduct);

      if (updateError) throw updateError;

      // Handle categories update
      if (editValues.categories) {
        // Delete existing categories
        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', editingProduct);

        // Add new categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', editValues.categories);

        if (categoriesData) {
          const categoryAssociations = categoriesData.map(category => ({
            product_id: editingProduct,
            category_id: category.id
          }));

          await supabase
            .from('product_categories')
            .insert(categoryAssociations);
        }
      }

      setEditingProduct(null);
      setEditValues({});
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleEditCancel = () => {
    console.log('ProductManagement: Canceling edit');
    setEditingProduct(null);
    setEditValues({});
  };

  const handleEditChange = (values: Partial<Product> & { categories?: string[] }) => {
    console.log('ProductManagement: Updating edit values:', values);
    setEditValues(values);
  };

  const handleDelete = async (id: string) => {
    console.log('ProductManagement: Deleting product:', id);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleImageUpload = (productId: string, url: string) => {
    console.log('ProductManagement: Image uploaded for product:', productId, url);
  };

  const handleVideoUpload = (productId: string, url: string) => {
    console.log('ProductManagement: Video uploaded for product:', productId, url);
  };

  const handleDeleteMedia = (productId: string, type: 'image' | 'video') => {
    console.log('ProductManagement: Deleting media for product:', productId, type);
  };

  const handleMediaClick = (type: 'image' | 'video', url: string) => {
    console.log('ProductManagement: Media clicked:', type, url);
  };

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error loading products: {error.message}</div>;
  }

  if (!products) {
    return <div>No products found</div>;
  }

  return (
    <div className="space-y-4">
      <ProductTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        showColumnToggle={!isMobile}
      />
      {isMobile ? (
        <ProductMobileGrid
          products={products}
          onEditStart={handleEditStart}
          onDelete={handleDelete}
        />
      ) : (
        <ProductTable
          products={products}
          editingProduct={editingProduct}
          editValues={editValues}
          visibleColumns={visibleColumns}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onEditChange={handleEditChange}
          onDelete={handleDelete}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          onDeleteMedia={handleDeleteMedia}
          onMediaClick={handleMediaClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}
    </div>
  );
}