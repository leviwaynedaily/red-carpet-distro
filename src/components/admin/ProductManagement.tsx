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

export function ProductManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categories, setCategories] = useState("");
  const [strain, setStrain] = useState("");
  const [potency, setPotency] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
          stock: stock,
          regular_price: regularPrice,
          shipping_price: shippingPrice,
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
      setStock(0);
      setRegularPrice(0);
      setShippingPrice(0);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
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
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Regular Price"
                value={regularPrice}
                onChange={(e) => setRegularPrice(Number(e.target.value))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Shipping Price"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(Number(e.target.value))}
              />
            </div>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((product) => (
                <AdminProductCard
                  key={product.id}
                  {...product}
                  image={product.image_url || "/placeholder.svg"}
                  categories={product.categories || []}
                  onUpdate={refetch}
                  onDelete={handleDelete}
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
                        onClick={() => {
                          // Find and trigger the edit button in the hidden AdminProductCard
                          const adminCard = document.querySelector(`[data-product-id="${product.id}"]`);
                          if (adminCard) {
                            const editButton = adminCard.querySelector('button[aria-label="Edit product"]') as HTMLButtonElement;
                            if (editButton) {
                              editButton.click();
                            }
                          }
                        }}
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

          {/* Hidden AdminProductCards for edit functionality */}
          <div className="hidden">
            {products?.map((product) => (
              <AdminProductCard
                key={product.id}
                {...product}
                image={product.image_url || "/placeholder.svg"}
                categories={product.categories || []}
                onUpdate={refetch}
                onDelete={handleDelete}
                data-product-id={product.id}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
