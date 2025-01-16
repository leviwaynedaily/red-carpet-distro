import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CategoryManagement() {
  const [newCategory, setNewCategory] = useState("");

  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      console.log("Categories fetched:", data);
      return data;
    },
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error("You must be logged in to manage categories");
      return;
    }

    try {
      console.log("Adding new category:", newCategory);
      const { error } = await supabase
        .from("categories")
        .insert([{ name: newCategory.trim() }]);

      if (error) {
        console.error("Error adding category:", error);
        if (error.code === '23505') {
          toast.error("A category with this name already exists");
        } else {
          toast.error("Failed to add category: " + error.message);
        }
        return;
      }

      toast.success("Category added successfully");
      setNewCategory("");
      refetch();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error("You must be logged in to manage categories");
      return;
    }

    try {
      console.log("Deleting category:", id);
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category: " + error.message);
        return;
      }

      toast.success("Category deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <span>{category.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteCategory(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}