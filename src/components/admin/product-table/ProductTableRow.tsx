import { Tables } from "@/integrations/supabase/types";
import { TableRow } from "@/components/ui/table";
import { ProductTableCell } from "./ProductTableCell";
import { ProductTableActions } from "./ProductTableActions";
import { ProductEditDialog } from "./ProductEditDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Product = Tables<"products">;

interface ProductTableRowProps {
  product: Product & { categories?: string[] };
  visibleColumns: string[];
  isEditing: boolean;
  editValues: Partial<Product> & { categories?: string[] };
  categories?: { id: string; name: string; }[];
  onEditStart: (product: Product & { categories?: string[] }) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onDelete: (id: string) => void;
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onDeleteMedia: (productId: string, type: 'image' | 'video') => void;
  onMediaClick: (type: 'image' | 'video', url: string) => void;
}

export function ProductTableRow({
  product,
  visibleColumns,
  isEditing,
  editValues,
  categories,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
  onImageUpload,
  onVideoUpload,
  onDeleteMedia,
  onMediaClick,
}: ProductTableRowProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    console.log('ProductTableRow: Starting edit for product:', product.id);
    onEditStart(product);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    console.log('ProductTableRow: Saving product:', product.id);
    console.log('ProductTableRow: New categories:', editValues.categories);
    
    try {
      // First, delete existing category associations
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', product.id);

      if (deleteError) throw deleteError;

      // Then, insert new category associations
      if (editValues.categories && editValues.categories.length > 0) {
        // Get category IDs for the selected category names
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', editValues.categories);

        if (categoryError) throw categoryError;

        if (categoryData && categoryData.length > 0) {
          const categoryAssociations = categoryData.map(category => ({
            product_id: product.id,
            category_id: category.id
          }));

          const { error: insertError } = await supabase
            .from('product_categories')
            .insert(categoryAssociations);

          if (insertError) throw insertError;
        }
      }

      await onEditSave();
      setShowEditDialog(false);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('ProductTableRow: Error saving categories:', error);
      toast.error('Failed to update product categories');
    }
  };

  const handleCancel = () => {
    console.log('ProductTableRow: Canceling edit');
    onEditCancel();
    setShowEditDialog(false);
  };

  return (
    <>
      <TableRow key={product.id}>
        {visibleColumns.map((column) => (
          <ProductTableCell
            key={column}
            column={column}
            product={product}
            isEditing={false}
            editValues={editValues}
            categories={categories}
            onEditChange={onEditChange}
            onMediaClick={onMediaClick}
            onDeleteMedia={onDeleteMedia}
            onImageUpload={onImageUpload}
            onVideoUpload={onVideoUpload}
          />
        ))}
        <ProductTableActions
          productId={product.id}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={onDelete}
        />
      </TableRow>

      <ProductEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={product}
        editValues={editValues}
        categories={categories}
        onEditChange={onEditChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onImageUpload={onImageUpload}
        onVideoUpload={onVideoUpload}
        onDeleteMedia={onDeleteMedia}
      />
    </>
  );
}