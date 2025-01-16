import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdminProductCard } from "./AdminProductCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { CategoryManagement } from "./CategoryManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileUpload } from "@/components/ui/file-upload";

export function ProductManagement() {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categories, setCategories] = useState("");
  const [strain, setStrain] = useState("");
  const [potency, setPotency] = useState("");
  const [stock, setStock] = useState<number | null>(null);
  const [regularPrice, setRegularPrice] = useState<number | null>(null);
  const [shippingPrice, setShippingPrice] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isMobile ? 'grid' : 'table');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("products").insert([
        {
          name,
          description,
          image_url: imageUrl,
          video_url: videoUrl,
          categories: categories.split(",").map((c) => c.trim()),
          strain,
          potency,
          stock: stock !== null ? stock : null,
          regular_price: regularPrice !== null ? regularPrice : null,
          shipping_price: shippingPrice !== null ? shippingPrice : null,
        },
      ]);

      if (error) throw error;

      toast.success("Product added successfully");
      refetch();
      // Reset form
      setName("");
      setDescription("");
      setImageUrl("");
      setVideoUrl("");
      setCategories("");
      setStrain("");
      setPotency("");
      setStock(null);
      setRegularPrice(null);
      setShippingPrice(null);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Editing product with values:', {
        stock: editingProduct.stock,
        regular_price: editingProduct.regular_price,
        shipping_price: editingProduct.shipping_price
      });
      
      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          image_url: editingProduct.image,
          video_url: editingProduct.video_url,
          categories: editingProduct.categories.split(",").map((c: string) => c.trim()),
          strain: editingProduct.strain,
          potency: editingProduct.potency,
          stock: editingProduct.stock === "" ? null : Number(editingProduct.stock),
          regular_price: editingProduct.regular_price === "" ? null : Number(editingProduct.regular_price),
          shipping_price: editingProduct.shipping_price === "" ? null : Number(editingProduct.shipping_price),
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast.success("Product updated successfully");
      setShowEditDialog(false);
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct({
      ...product,
      image: product.image_url,
      categories: Array.isArray(product.categories) ? product.categories.join(", ") : "",
    });
    setShowEditDialog(true);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Strain"
                value={strain}
                onChange={(e) => setStrain(e.target.value)}
              />
              <Input
                placeholder="Potency (THC %)"
                value={potency}
                onChange={(e) => setPotency(e.target.value)}
              />
              <Input
                placeholder="Categories (comma-separated)"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Stock (optional)"
                value={stock === null ? "" : stock}
                onChange={(e) => setStock(e.target.value === "" ? null : Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Regular Price (optional)"
                value={regularPrice === null ? "" : regularPrice}
                onChange={(e) => setRegularPrice(e.target.value === "" ? null : Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Shipping Price (optional)"
                value={shippingPrice === null ? "" : shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value === "" ? null : Number(e.target.value))}
              />
            </div>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image</label>
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-md mb-2" />
                )}
                <FileUpload
                  onUploadComplete={setImageUrl}
                  accept="image/*"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Video</label>
                {videoUrl && (
                  <video src={videoUrl} className="w-32 h-32 object-cover rounded-md mb-2" controls />
                )}
                <FileUpload
                  onUploadComplete={setVideoUrl}
                  accept="video/*"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </form>

          <div className="flex justify-end space-x-2">
            <Toggle
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === 'table'}
              onPressedChange={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products?.map((product) => (
                <AdminProductCard
                  key={product.id}
                  {...product}
                  image={product.image_url || "/placeholder.svg"}
                  categories={product.categories || []}
                  onUpdate={refetch}
                  onDelete={handleDelete}
                  onEdit={() => handleEditClick(product)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Strain</TableHead>
                    <TableHead>Potency</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categories?.join(', ') || '-'}</TableCell>
                      <TableCell>{product.strain || '-'}</TableCell>
                      <TableCell>{product.potency || '-'}</TableCell>
                      <TableCell>{product.stock || '0'}</TableCell>
                      <TableCell>{formatPrice(product.regular_price)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to your product here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Image</label>
                    {editingProduct?.image && (
                      <img 
                        src={editingProduct.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-md mb-2" 
                      />
                    )}
                    <FileUpload
                      onUploadComplete={(url) => setEditingProduct({ ...editingProduct, image: url })}
                      accept="image/*"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Video</label>
                    {editingProduct?.video_url && (
                      <video 
                        src={editingProduct.video_url} 
                        className="w-32 h-32 object-cover rounded-md mb-2" 
                        controls 
                      />
                    )}
                    <FileUpload
                      onUploadComplete={(url) => setEditingProduct({ ...editingProduct, video_url: url })}
                      accept="video/*"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories (comma-separated)</label>
                  <Input
                    value={editingProduct?.categories || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categories: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strain</label>
                  <Input
                    value={editingProduct?.strain || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, strain: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Potency</label>
                  <Input
                    value={editingProduct?.potency || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, potency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    value={editingProduct?.stock === null ? "" : editingProduct?.stock}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      stock: e.target.value === "" ? null : Number(e.target.value) 
                    })}
                    placeholder="Leave empty if not applicable"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regular Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct?.regular_price === null ? "" : editingProduct?.regular_price}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      regular_price: e.target.value === "" ? null : Number(e.target.value) 
                    })}
                    placeholder="Leave empty if not applicable"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shipping Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct?.shipping_price === null ? "" : editingProduct?.shipping_price}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      shipping_price: e.target.value === "" ? null : Number(e.target.value) 
                    })}
                    placeholder="Leave empty if not applicable"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}