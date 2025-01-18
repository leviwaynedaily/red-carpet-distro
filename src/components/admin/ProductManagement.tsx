import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryManagement } from "./CategoryManagement";
import { ProductTableFilters } from "./ProductTableFilters";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Play, Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";

type Product = Tables<"products", never>;

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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
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

  const handleImageUpload = async (productId: string, file: File) => {
    try {
      const sanitizedName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const fileExt = file.name.split('.').pop();
      const filePath = `products/${productId}/${sanitizedName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Image uploaded successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product image:", error);
      toast.error("Failed to update product image");
    }
  };

  const handleVideoUpload = async (productId: string, file: File) => {
    try {
      const sanitizedName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const fileExt = file.name.split('.').pop();
      const filePath = `products/${productId}/${sanitizedName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from("products")
        .update({ video_url: publicUrl })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Video uploaded successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product video:", error);
      toast.error("Failed to update product video");
    }
  };

  const handleDeleteMedia = async (productId: string, type: 'image' | 'video') => {
    try {
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

        if (storageError) throw storageError;
      }

      // Update product record
      const updateData = type === 'image' 
        ? { image_url: null, media: null }
        : { video_url: null, primary_media_type: 'image' };

      const { error: dbError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);

      if (dbError) throw dbError;

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

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <CategoryManagement />
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow 
                key={product.id}
                className="cursor-pointer"
                onClick={() => !editingProduct && handleEditStart(product)}
              >
                {visibleColumns.includes('name') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      product.name
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('strain') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        value={editValues.strain || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, strain: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      product.strain || '-'
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('description') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        value={editValues.description || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      product.description || '-'
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('image') && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.image_url && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMediaClick('image', product.image_url!);
                            }}
                          >
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </Button>
                          {editingProduct === product.id && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(product.id, 'image');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      {editingProduct === product.id && (
                        <FileUpload
                          onUploadComplete={(file) => handleImageUpload(product.id, file)}
                          accept="image/*"
                          bucket="media"
                          folderPath={`products/${product.id}`}
                          fileName="image"
                          className="w-8"
                          buttonContent={<Upload className="h-4 w-4" />}
                          productName={product.name} // Pass the product name here
                        />
                      )}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('video_url') && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.video_url && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMediaClick('video', product.video_url!);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          {editingProduct === product.id && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(product.id, 'video');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      {editingProduct === product.id && (
                        <FileUpload
                          onUploadComplete={(file) => handleVideoUpload(product.id, file)}
                          accept="video/*"
                          bucket="media"
                          folderPath={`products/${product.id}`}
                          fileName="video"
                          className="w-8"
                          buttonContent={<Upload className="h-4 w-4" />}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('categories') && (
                  <TableCell>{product.categories?.join(", ") || '-'}</TableCell>
                )}
                {visibleColumns.includes('stock') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        type="number"
                        value={editValues.stock || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      product.stock || '-'
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('regular_price') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        type="number"
                        value={editValues.regular_price || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, regular_price: parseFloat(e.target.value) }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      formatPrice(product.regular_price)
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('shipping_price') && (
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        type="number"
                        value={editValues.shipping_price || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, shipping_price: parseFloat(e.target.value) }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      formatPrice(product.shipping_price)
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {editingProduct === product.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSave();
                          }}
                          aria-label="Save changes"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCancel();
                          }}
                          aria-label="Cancel editing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
