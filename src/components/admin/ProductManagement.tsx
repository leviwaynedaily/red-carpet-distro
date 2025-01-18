import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryManagement } from "./CategoryManagement";
import { ProductTableFilters } from "./ProductTableFilters";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { convertToWebP } from "@/utils/imageUtils";
import { ProductTable } from "./ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Product = Tables<"products">;

const COLUMNS = [
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

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(c => c.key));
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [showMedia, setShowMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('ProductManagement: Fetching products');
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('ProductManagement: Error fetching products:', error);
        throw error;
      }
      
      console.log('ProductManagement: Successfully fetched products:', data?.length);
      setProducts(data || []);
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
      
      // Basic validation
      if (!id) {
        console.error('ProductManagement: Invalid product ID - empty or undefined');
        toast.error("Invalid product ID");
        return;
      }

      // UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error('ProductManagement: Invalid UUID format:', id);
        toast.error("Invalid product ID format");
        return;
      }

      // Get product details before deletion (for logging)
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error('ProductManagement: Error fetching product before deletion:', fetchError);
        throw fetchError;
      }

      console.log('ProductManagement: Found product to delete:', product);

      // Perform the deletion
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error('ProductManagement: Error deleting product:', deleteError);
        throw deleteError;
      }

      console.log('ProductManagement: Successfully deleted product:', id);
      toast.success("Product deleted successfully");
      
      // Refresh the products list
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const handleEditStart = (product: Product) => {
    setEditingProduct(product.id);
    setEditValues(product);
  };

  const handleEditSave = async () => {
    if (!editingProduct || !editValues) return;

    try {
      const { error } = await supabase
        .from("products")
        .update(editValues)
        .eq("id", editingProduct);

      if (error) throw error;

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.strain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <CategoryManagement />
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

      <ProductTable
        products={filteredProducts}
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
