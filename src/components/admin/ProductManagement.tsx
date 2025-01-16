import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProductManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState("");
  const [strain, setStrain] = useState("");
  const [potency, setPotency] = useState("");

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover rounded"
            />
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">{product.strain}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}