import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductTableFilters } from "./ProductTableFilters";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { convertToWebP } from "@/utils/imageUtils";
import { AdminProductCard } from "./AdminProductCard";
import { Button } from "@/components/ui/button";

type Product = Tables<"products">;

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});

  console.log('ProductManagement: Component rendered');

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

      if (error) throw error;
      console.log('ProductManagement: Products fetched successfully:', data?.length);
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      console.log('ProductManagement: Deleting product:', id);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditStart = (product: Product) => {
    console.log('ProductManagement: Starting edit for product:', product.id);
    setEditingProduct(product.id);
    setEditValues(product);
  };

  const handleEditSave = async () => {
    if (!editingProduct || !editValues) return;

    try {
      console.log('ProductManagement: Saving edits for product:', editingProduct);
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
    console.log('ProductManagement: Canceling edit');
    setEditingProduct(null);
    setEditValues({});
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
    console.log('ProductManagement: Opening media viewer:', { type, url });
    setSelectedMedia({ type, url });
    setShowMedia(true);
  };

  const handleImageUpload = async (productId: string, url: string) => {
    try {
      console.log('ProductManagement: Starting image upload for product:', productId);
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const sanitizedName = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${sanitizedName}.${url.split('.').pop()}`, { type: blob.type });

      console.log('ProductManagement: Converting image to WebP');
      const { webpBlob } = await convertToWebP(file);
      const webpFile = new File([webpBlob], `${sanitizedName}.webp`, { type: 'image/webp' });

      const webpPath = `products/${productId}/${sanitizedName}.webp`;
      const { error: webpError } = await supabase.storage
        .from('media')
        .upload(webpPath, webpFile, {
          contentType: 'image/webp',
          upsert: true
        });

      if (webpError) throw webpError;

      const { data: { publicUrl: webpUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(webpPath);

      const { error: updateError } = await supabase
        .from("products")
        .update({ 
          image_url: webpUrl,
          media: {
            webp: webpUrl
          }
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      toast.success("Image uploaded successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product image:", error);
      toast.error("Failed to update product image");
    }
  };

  const handleVideoUpload = async (productId: string, url: string) => {
    try {
      console.log('ProductManagement: Updating video URL for product:', productId);
      const { error } = await supabase
        .from("products")
        .update({ video_url: url })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Video uploaded successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product video:", error);
      toast.error("Failed to update product video");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.strain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <ProductTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <AdminProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEditStart(product)}
            onDelete={() => handleDeleteProduct(product.id)}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            onMediaClick={handleMediaClick}
            isEditing={editingProduct === product.id}
            editValues={editValues}
            onEditChange={setEditValues}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
          />
        ))}
      </div>

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