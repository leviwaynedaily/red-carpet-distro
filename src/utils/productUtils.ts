import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateProductFields = async (productId: string, updates: Record<string, any>) => {
  try {
    console.log('Updating product:', productId, 'with updates:', updates);
    
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);

    if (error) throw error;
    
    console.log('Product updated successfully');
    toast.success('Product updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
    return false;
  }
};

// Update specific product to remove a category
export const removeProductCategory = async (productId: string, categoryToRemove: string) => {
  try {
    console.log('Removing category:', categoryToRemove, 'from product:', productId);
    
    // First get the current product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('categories')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    // Filter out the category we want to remove
    const updatedCategories = (product.categories || []).filter(
      (category: string) => category !== categoryToRemove
    );

    // Update the product with the new categories array
    const { error: updateError } = await supabase
      .from('products')
      .update({ categories: updatedCategories })
      .eq('id', productId);

    if (updateError) throw updateError;

    console.log('Category removed successfully');
    toast.success('Category removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing category:', error);
    toast.error('Failed to remove category');
    return false;
  }
};