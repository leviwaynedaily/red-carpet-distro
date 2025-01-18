import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CategoryForm({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

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
      onCategoryAdded();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  return (
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
  );
}