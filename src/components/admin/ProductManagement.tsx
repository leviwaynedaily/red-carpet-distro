import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdminProductCard } from "./AdminProductCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutGrid, List } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export function ProductManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState("");
  const [strain, setStrain] = useState("");
  const [potency, setPotency] = useState("");
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
          categories: categories.split(",").map((c) => c.trim()),
          strain,
          potency,
        },
      ]);

      if (error) throw error;

      toast.success("Product added successfully");
      refetch();
      // Reset form
      setName("");
      setDescription("");
      setImageUrl("");
      setCategories("");
      setStrain("");
      setPotency("");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input
          placeholder="Categories (comma-separated)"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
        <Input
          placeholder="Strain"
          value={strain}
          onChange={(e) => setStrain(e.target.value)}
        />
        <Input
          placeholder="Potency"
          value={potency}
          onChange={(e) => setPotency(e.target.value)}
        />
        <Button type="submit">Add Product</Button>
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
                          // Open edit dialog through AdminProductCard
                          const adminCard = document.querySelector(`[data-product-id="${product.id}"]`);
                          const editButton = adminCard?.querySelector('button[aria-label="Edit product"]');
                          editButton?.click();
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
    </div>
  );
}