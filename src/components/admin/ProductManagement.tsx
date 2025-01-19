import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductTableFilters } from "./ProductTableFilters";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductsList } from "./product-table/ProductsList";
import { downloadTemplate, exportProducts, parseCSV } from "@/utils/csvUtils";
import { useProducts } from "@/hooks/useProducts";

type Product = Tables<"products">;
type ProductWithCategories = Product & { categories?: string[] };

const COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "strain", label: "Strain", sortable: true },
  { key: "description", label: "Description", sortable: true },
  { key: "image", label: "Image", sortable: false },
  { key: "video_url", label: "Video", sortable: false },
  { key: "categories", label: "Categories", sortable: false },
  { key: "stock", label: "Stock", sortable: true },
  { key: "regular_price", label: "Price", sortable: true },
  { key: "shipping_price", label: "Shipping", sortable: true },
];

export function ProductManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(c => c.key));
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});
  const [showMedia, setShowMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'created_at', 
    direction: 'desc' 
  });
  const queryClient = useQueryClient();

  const handleAddProduct = async () => {
    try {
      console.log('ProductManagement: Creating new product');
      const newProduct = {
        name: "New Product",
        stock: 0,
        regular_price: 0,
        shipping_price: 0,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('ProductManagement: Error creating product:', error);
        throw error;
      }

      console.log('ProductManagement: Product created successfully:', data);
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Start editing the new product immediately
      if (data) {
        handleEditStart(data);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      console.log('ProductManagement: Starting product deletion for ID:', id);
      
      // Delete product categories first
      const { error: categoryError } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', id);

      if (categoryError) {
        console.error('ProductManagement: Error deleting product categories:', categoryError);
        throw categoryError;
      }

      // Then delete the product
      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (productError) {
        console.error('ProductManagement: Error deleting product:', productError);
        throw productError;
      }

      console.log('ProductManagement: Successfully deleted product:', id);
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditStart = (product: Product & { categories?: string[] }) => {
    setEditingProduct(product.id);
    setEditValues({
      ...product,
      categories: product.categories || []
    });
  };

  const handleEditSave = async () => {
    if (!editingProduct || !editValues) return;

    try {
      console.log('ProductManagement: Saving product edits:', editValues);
      
      // Update the product basic information
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: editValues.name,
          description: editValues.description,
          strain: editValues.strain,
          stock: editValues.stock,
          regular_price: editValues.regular_price,
          shipping_price: editValues.shipping_price,
        })
        .eq("id", editingProduct);

      if (updateError) {
        console.error('ProductManagement: Error updating product:', updateError);
        throw updateError;
      }

      // Handle categories update
      if (editValues.categories) {
        // Get category IDs for the selected names
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', editValues.categories);

        if (categoryData) {
          // Delete existing category relationships
          await supabase
            .from('product_categories')
            .delete()
            .eq('product_id', editingProduct);

          // Insert new category relationships
          const categoryRelations = categoryData.map(category => ({
            product_id: editingProduct,
            category_id: category.id
          }));

          const { error: insertError } = await supabase
            .from('product_categories')
            .insert(categoryRelations);

          if (insertError) {
            console.error('ProductManagement: Error inserting new categories:', insertError);
            throw insertError;
          }
        }
      }

      console.log('ProductManagement: Product and categories updated successfully');
      toast.success("Product updated successfully");
      setEditingProduct(null);
      setEditValues({});
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleMediaClick = (type: 'image' | 'video', url: string) => {
    setSelectedMedia({ type, url });
    setShowMedia(true);
  };

  const handleImageUpload = async (productId: string, url: string) => {
    try {
      console.log('ProductManagement: Starting image upload process for product:', productId);
      
      // Find the product to get its name
      const { data: product } = await supabase
        .from("products")
        .select()
        .eq('id', productId)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      // Create a sanitized filename from the product name
      const sanitizedName = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Update product record with URL
      const { error: updateError } = await supabase
        .from("products")
        .update({ 
          image_url: url,
          media: {
            webp: url
          }
        })
        .eq("id", productId);

      if (updateError) {
        console.error('ProductManagement: Error updating product record:', updateError);
        throw updateError;
      }

      console.log('ProductManagement: Product record updated successfully');
      toast.success("Image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error("Error updating product image:", error);
      toast.error("Failed to update product image");
    }
  };

  const handleVideoUpload = async (productId: string, url: string) => {
    try {
      console.log('ProductManagement: Uploading video for product:', productId);
      const { error } = await supabase
        .from("products")
        .update({ video_url: url })
        .eq("id", productId);

      if (error) {
        console.error('ProductManagement: Error updating video URL:', error);
        throw error;
      }

      console.log('ProductManagement: Video URL updated successfully');
      toast.success("Video uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error("Error updating product video:", error);
      toast.error("Failed to update product video");
    }
  };

  const handleDeleteMedia = async (productId: string, type: 'image' | 'video') => {
    try {
      console.log('ProductManagement: Deleting media for product:', productId, 'type:', type);
      
      // Update product record
      const updateData = type === 'image' 
        ? { image_url: null, media: null }
        : { video_url: null };

      const { error: dbError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);

      if (dbError) {
        console.error('ProductManagement: Error updating product record:', dbError);
        throw dbError;
      }

      console.log('ProductManagement: Media deleted successfully');
      toast.success(`${type === 'image' ? 'Image' : 'Video'} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: 
        current.key === key && current.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const products = await parseCSV(file);
        console.log('ProductManagement: Importing products:', products);

        for (const product of products) {
          if (!product.name) {
            toast.error(`Failed to import product: Name is required`);
            continue;
          }

          const { data, error } = await supabase
            .from("products")
            .insert([{
              name: product.name,
              description: product.description,
              strain: product.strain,
              stock: product.stock || 0,
              regular_price: product.regular_price || 0,
              shipping_price: product.shipping_price || 0,
            }])
            .select()
            .single();

          if (error) {
            console.error('ProductManagement: Error importing product:', error);
            toast.error(`Failed to import product: ${product.name}`);
            continue;
          }

          // Handle categories if present
          if (product.categories && product.categories.length > 0 && data) {
            for (const categoryName of product.categories) {
              // Get or create category
              let { data: category } = await supabase
                .from("categories")
                .select()
                .eq("name", categoryName)
                .single();

              if (!category) {
                const { data: newCategory } = await supabase
                  .from("categories")
                  .insert({ name: categoryName })
                  .select()
                  .single();
                category = newCategory;
              }

              if (category) {
                await supabase
                  .from("product_categories")
                  .insert({
                    product_id: data.id,
                    category_id: category.id,
                  });
              }
            }
          }
        }

        toast.success("Products imported successfully");
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } catch (error) {
        console.error("Error importing products:", error);
        toast.error("Failed to import products");
      }
    };
    input.click();
  };

  const { data: products } = useProducts();

  const handleExport = () => {
    if (!products) {
      toast.error("No products to export");
      return;
    }
    exportProducts(products);
    toast.success("Products exported successfully");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={handleAddProduct}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columns={COLUMNS}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <ProductsList
        searchQuery={searchQuery}
        visibleColumns={visibleColumns}
        editingProduct={editingProduct}
        editValues={editValues}
        sortConfig={sortConfig}
        onEditStart={handleEditStart}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        onEditChange={setEditValues}
        onDelete={handleDeleteProduct}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
        onDeleteMedia={handleDeleteMedia}
        onMediaClick={handleMediaClick}
        onSort={handleSort}
      />

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedMedia?.type === 'video' ? (
            <video
              src={selectedMedia.url}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            selectedMedia?.url && (
              <img
                src={selectedMedia.url}
                alt="Product media"
                className="w-full h-full object-contain"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}