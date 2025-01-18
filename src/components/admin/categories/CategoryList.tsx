import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategoryItem } from "./CategoryItem";

export function CategoryList() {
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleEditCategory = async (id: string, newName: string) => {
    try {
      console.log("Editing category:", id, "new name:", newName);
      const categoryToUpdate = categories?.find(cat => cat.id === id);
      
      if (!categoryToUpdate) {
        toast.error("Category not found");
        return;
      }

      const oldName = categoryToUpdate.name;
      const trimmedNewName = newName.trim();

      // First update the category name
      const { error: categoryError } = await supabase
        .from("categories")
        .update({ name: trimmedNewName })
        .eq("id", id);

      if (categoryError) {
        console.error("Error updating category:", categoryError);
        if (categoryError.code === '23505') {
          toast.error("A category with this name already exists");
        } else {
          toast.error("Failed to update category: " + categoryError.message);
        }
        return;
      }

      // Then update all products that use this category
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, categories");

      if (fetchError) {
        console.error("Error fetching products:", fetchError);
        toast.error("Failed to update products with new category name");
        return;
      }

      const productsToUpdate = products.filter(product => 
        product.categories && product.categories.includes(oldName)
      );

      for (const product of productsToUpdate) {
        const updatedCategories = (product.categories || []).map(cat => 
          cat === oldName ? trimmedNewName : cat
        );

        const { error: productError } = await supabase
          .from("products")
          .update({ categories: updatedCategories })
          .eq("id", product.id);

        if (productError) {
          console.error("Error updating product categories:", productError);
          toast.error("Failed to update some products with new category name");
        }
      }

      toast.success("Category and products updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log("Deleting category:", id);
      
      const categoryToDelete = categories?.find(cat => cat.id === id);
      if (!categoryToDelete) {
        toast.error("Category not found");
        return;
      }

      // Update products to remove the deleted category
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, categories");

      if (fetchError) {
        console.error("Error fetching products:", fetchError);
        toast.error("Failed to update products before category deletion");
        return;
      }

      const productsToUpdate = products.filter(product => 
        product.categories && product.categories.includes(categoryToDelete.name)
      );

      for (const product of productsToUpdate) {
        const updatedCategories = (product.categories || []).filter(cat => 
          cat !== categoryToDelete.name
        );

        const { error: productError } = await supabase
          .from("products")
          .update({ categories: updatedCategories })
          .eq("id", product.id);

        if (productError) {
          console.error("Error updating product categories:", productError);
          toast.error("Failed to update some products during category deletion");
        }
      }

      // Finally delete the category
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting category:", deleteError);
        toast.error("Failed to delete category: " + deleteError.message);
        return;
      }

      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories?.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      ))}
    </div>
  );
}