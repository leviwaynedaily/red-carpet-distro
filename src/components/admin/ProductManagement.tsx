import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductTableFilters } from "./ProductTableFilters";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { convertToWebP } from "@/utils/imageUtils";
import { ProductTable } from "./ProductTable";
import { ProductMobileGrid } from "./product-table/ProductMobileGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

type Product = Tables<"products">;

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
  const [products, setProducts] = useState<(Product & { categories: string[] })[]>([]);
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
  const isMobile = useIsMobile();

  const fetchProducts = async () => {
    try {
      console.log('ProductManagement: Fetching products with categories');
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          product_categories!left (
            categories (
              name
            )
          )
        `);

      if (productsError) {
        console.error('ProductManagement: Error fetching products:', productsError);
        throw productsError;
      }

      // Transform the data to include categories array, handling products without categories
      const transformedProducts = productsData.map(product => ({
        ...product,
        categories: product.product_categories
          ?.map(pc => pc.categories?.name)
          .filter(Boolean) || []
      }));

      console.log('ProductManagement: Successfully fetched products:', transformedProducts);
      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

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
      await fetchProducts();
      
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
      await fetchProducts();
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
        // First, get category IDs for the selected names
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', editValues.categories);

        if (categoryError) {
          console.error('ProductManagement: Error fetching category IDs:', categoryError);
          throw categoryError;
        }

        // Delete existing category relationships
        const { error: deleteError } = await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', editingProduct);

        if (deleteError) {
          console.error('ProductManagement: Error deleting existing categories:', deleteError);
          throw deleteError;
        }

        // Insert new category relationships
        if (categoryData && categoryData.length > 0) {
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
      fetchProducts();
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

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleDownloadTemplate = () => {
    toast.info("Template download coming soon");
  };

  const handleMediaClick = (type: 'image' | 'video', url: string) => {
    setSelectedMedia({ type, url });
    setShowMedia(true);
  };

  const handleImageUpload = async (productId: string, url: string) => {
    try {
      console.log('ProductManagement: Starting image upload process for product:', productId);
      
      // Find the product to get its name
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Create a sanitized filename from the product name
      const sanitizedName = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Fetch the uploaded file
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${sanitizedName}.${url.split('.').pop()}`, { type: blob.type });

      console.log('ProductManagement: Original file details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Convert to WebP
      console.log('ProductManagement: Converting image to WebP format');
      const { webpBlob } = await convertToWebP(file);
      const webpFile = new File([webpBlob], `${sanitizedName}.webp`, { type: 'image/webp' });

      console.log('ProductManagement: WebP file details:', {
        name: webpFile.name,
        type: webpFile.type,
        size: webpFile.size
      });

      // Upload WebP version only
      const webpPath = `products/${productId}/${sanitizedName}.webp`;
      const { error: webpError, data: webpData } = await supabase.storage
        .from('media')
        .upload(webpPath, webpFile, {
          contentType: 'image/webp',
          upsert: true
        });

      if (webpError) {
        console.error('ProductManagement: Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('ProductManagement: WebP version uploaded successfully');

      // Get public URL for WebP
      const { data: { publicUrl: webpUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(webpPath);

      console.log('ProductManagement: Generated WebP URL:', webpUrl);

      // Update product record with WebP URL only
      const { error: updateError } = await supabase
        .from("products")
        .update({ 
          image_url: webpUrl,
          media: {
            webp: webpUrl
          }
        })
        .eq("id", productId);

      if (updateError) {
        console.error('ProductManagement: Error updating product record:', updateError);
        throw updateError;
      }

      console.log('ProductManagement: Product record updated successfully');
      toast.success("Image uploaded successfully");
      fetchProducts();
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
      fetchProducts();
    } catch (error) {
      console.error("Error updating product video:", error);
      toast.error("Failed to update product video");
    }
  };

  const handleDeleteMedia = async (productId: string, type: 'image' | 'video') => {
    try {
      console.log('ProductManagement: Deleting media for product:', productId, 'type:', type);
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Delete from storage first
      const filePath = type === 'image' ? product.image_url : product.video_url;
      if (filePath) {
        const filePathParts = filePath.split('/');
        const fileName = filePathParts[filePathParts.length - 1];
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([`products/${productId}/${fileName}`]);

        if (storageError) {
          console.error('ProductManagement: Error deleting from storage:', storageError);
          throw storageError;
        }
      }

      // Update product record
      const updateData = type === 'image' 
        ? { image_url: null, media: null }
        : { video_url: null, primary_media_type: 'image' };

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
      fetchProducts();
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.strain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * modifier;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * modifier;
    }
    
    return 0;
  });

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

      {isMobile ? (
        <ProductMobileGrid
          products={sortedProducts}
          onEditStart={handleEditStart}
          onDelete={handleDeleteProduct}
        />
      ) : (
        <ProductTable
          products={sortedProducts}
          visibleColumns={visibleColumns}
          editingProduct={editingProduct}
          editValues={editValues}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onEditChange={setEditValues}
          onDelete={handleDeleteProduct}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          onDeleteMedia={handleDeleteMedia}
          onMediaClick={handleMediaClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}

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
