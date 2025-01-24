import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductTable } from "./ProductTable";
import { ProductTableFilters } from "./ProductTableFilters";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductMobileGrid } from "./product-table/ProductMobileGrid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AddProductDialog } from "./product-table/AddProductDialog";
import { downloadTemplate, exportProducts, parseCSV } from "@/utils/csvUtils";

type Product = Tables<"products">;

export function ProductManagement() {
  const { data: products, isLoading, error } = useProducts();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAddingSaving, setIsAddingSaving] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "strain",
    "image",
    "video_url",
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
    setVisibleColumns((current) =>
      current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey]
    );
  };

  const handleEditStart = async (product: Product & { categories?: string[] }) => {
    console.log("ProductManagement: Starting edit for product:", product.id);
    setEditingProduct(product.id);
    setEditValues({
      ...product,
      categories: product.categories || [],
    });
  };

  const handleEditSave = async () => {
    console.log("ProductManagement: Saving product:", editingProduct);
    try {
      if (!editingProduct || !editValues.name) {
        toast.error("Product name is required");
        return;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: editValues.name,
          description: editValues.description,
          strain: editValues.strain,
          stock: editValues.stock,
          regular_price: editValues.regular_price,
          shipping_price: editValues.shipping_price,
          primary_media_type: "image",
          media: [],
        })
        .eq("id", editingProduct);

      if (updateError) throw updateError;

      // Handle categories update
      if (editValues.categories) {
        const { error: deleteError } = await supabase
          .from("product_categories")
          .delete()
          .eq("product_id", editingProduct);

        if (deleteError) throw deleteError;

        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name")
          .in("name", editValues.categories);

        if (categoriesData) {
          const categoryAssociations = categoriesData.map((category) => ({
            product_id: editingProduct,
            category_id: category.id,
          }));

          const { error: insertError } = await supabase
            .from("product_categories")
            .insert(categoryAssociations);

          if (insertError) throw insertError;
        }
      }

      // Invalidate and refetch products after successful save
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "product_categories"] });

      setEditingProduct(null);
      setEditValues({});
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleEditCancel = () => {
    console.log("ProductManagement: Canceling edit");
    setEditingProduct(null);
    setEditValues({});
  };

  const handleEditChange = (values: Partial<Product> & { categories?: string[] }) => {
    console.log("ProductManagement: Updating edit values:", values);
    setEditValues(values);
  };

  const handleDelete = async (id: string) => {
    console.log("ProductManagement: Deleting product:", id);
    try {
      // First delete associated categories
      const { error: categoryError } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", id);

      if (categoryError) throw categoryError;

      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product_categories"] });

      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleMediaUpload = async (productId: string, file: File) => {
    console.log("ProductManagement: Uploading media for product:", productId);
    try {
      const fileType = file.type.split('/')[0]; // 'image' or 'video'
      
      if (fileType !== 'image' && fileType !== 'video') {
        toast.error('Please upload only image or video files');
        return;
      }

      if (fileType === 'video') {
        // Create video element to generate thumbnail
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        
        // Wait for video metadata to load
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        // Create canvas and draw video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        // Convert canvas to blob
        const thumbnailBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.8);
        });

        // Upload video and thumbnail to storage
        const videoPath = `videos/${Date.now()}-${file.name}`;
        const thumbnailPath = `images/${Date.now()}-thumbnail.webp`;

        const { error: videoError, data: videoData } = await supabase.storage
          .from('media')
          .upload(videoPath, file);

        if (videoError) throw videoError;

        const { error: thumbnailError, data: thumbnailData } = await supabase.storage
          .from('media')
          .upload(thumbnailPath, thumbnailBlob);

        if (thumbnailError) throw thumbnailError;

        // Get public URLs
        const videoUrl = supabase.storage.from('media').getPublicUrl(videoPath).data.publicUrl;
        const thumbnailUrl = supabase.storage.from('media').getPublicUrl(thumbnailPath).data.publicUrl;

        // Update product with both URLs
        const { error: updateError } = await supabase
          .from('products')
          .update({
            video_url: videoUrl,
            image_url: thumbnailUrl
          })
          .eq('id', productId);

        if (updateError) throw updateError;
        toast.success('Video uploaded with thumbnail');
      } else {
        // Handle image upload
        const path = `images/${Date.now()}-${file.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const imageUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', productId);

        if (updateError) throw updateError;
        toast.success('Image uploaded successfully');
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    }
  };

  const handleDeleteMedia = async (productId: string, type: "image" | "video") => {
    console.log("ProductManagement: Deleting media for product:", productId, type);
    try {
      const updateData = type === "image" ? { image_url: null } : { video_url: null };
      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleMediaClick = (type: "image" | "video", url: string) => {
    console.log("ProductManagement: Media clicked:", type, url);
    window.open(url, "_blank");
  };

  const handleAddProduct = async (product: Partial<Product>): Promise<boolean> => {
    console.log("Starting product add:", product);
    setIsAddingSaving(true);
    try {
      // Validate required fields
      if (!product.name) {
        toast.error("Product name is required");
        return false;
      }

      // Force TS to see `name` as a string
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: product.name as string,
            description: product.description,
            strain: product.strain,
            stock: product.stock || 0,
            regular_price: product.regular_price || 0,
            shipping_price: product.shipping_price || 0,
            image_url: product.image_url,
            video_url: product.video_url,
            primary_media_type: "image",
            media: [],
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Product added successfully:", data);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Only close dialog and show success after everything is complete
      setShowAddDialog(false);
      toast.success("Product added successfully");
      return true;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      return false;
    } finally {
      setIsAddingSaving(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const importedProducts = await parseCSV(file);
        console.log("Importing products:", importedProducts);

        for (const product of importedProducts) {
          // Skip if there's no name
          if (!product.name) {
            console.error("Skipping product without name:", product);
            continue;
          }

          const { error } = await supabase.from("products").insert([
            {
              name: product.name as string,
              description: product.description,
              strain: product.strain,
              stock: product.stock,
              regular_price: product.regular_price,
              shipping_price: product.shipping_price,
              primary_media_type: "image",
              media: [],
            },
          ]);

          if (error) {
            console.error("Error importing product:", error);
            throw error;
          }
        }

        await queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success("Products imported successfully");
      } catch (error) {
        console.error("Error importing products:", error);
        toast.error("Failed to import products");
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (!products) return;
    exportProducts(products);
    toast.success("Products exported successfully");
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
    toast.success("Template downloaded successfully");
  };

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;
  if (!products) return <div>No products found</div>;

  return (
    <div className="space-y-4">
      <ProductTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        showColumnToggle={!isMobile}
        onAddProduct={() => setShowAddDialog(true)}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {isMobile ? (
        <ProductMobileGrid
          products={products}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onEditChange={handleEditChange}
          editingProduct={editingProduct}
          editValues={editValues}
          onDelete={handleDelete}
          onMediaUpload={handleMediaUpload}
          onDeleteMedia={handleDeleteMedia}
          onMediaClick={handleMediaClick}
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
          // Removing onMediaUpload since it's not in ProductTableProps
          onDeleteMedia={handleDeleteMedia} 
          onMediaClick={handleMediaClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAddProduct}
        isSaving={isAddingSaving}
      />
    </div>
  );
}
