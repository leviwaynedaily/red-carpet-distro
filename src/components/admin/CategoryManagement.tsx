import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

export function CategoryManagement() {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

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

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim()) return;

    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error("You must be logged in to manage categories");
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editingName.trim() })
        .eq("id", id);

      if (error) {
        console.error("Error updating category:", error);
        if (error.code === '23505') {
          toast.error("A category with this name already exists");
        } else {
          toast.error("Failed to update category: " + error.message);
        }
        return;
      }

      toast.success("Category updated successfully");
      setEditingId(null);
      setEditingName("");
      refetch();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
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

  const startEditing = (category: { id: string; name: string }) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
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
            {editingId === category.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCategory(category.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span>{category.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}