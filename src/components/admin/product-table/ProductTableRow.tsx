import { Tables } from "@/integrations/supabase/types";
import { TableRow } from "@/components/ui/table";
import { ProductTableCell } from "./ProductTableCell";
import { ProductTableActions } from "./ProductTableActions";
import { supabase } from "@/integrations/supabase/client";

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
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSave();
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  };

  const handleSave = async () => {
    if (editValues.categories) {
      // Get category IDs for the selected category names
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', editValues.categories);

      if (categoryData) {
        // Delete existing category relationships
        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', product.id);

        // Insert new category relationships
        const categoryRelations = categoryData.map(category => ({
          product_id: product.id,
          category_id: category.id
        }));

        await supabase
          .from('product_categories')
          .insert(categoryRelations);
      }
    }

    onEditSave();
  };

  return (
    <TableRow 
      key={product.id}
      className={`cursor-pointer ${isEditing ? 'bg-muted/50' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {visibleColumns.map((column) => (
        <ProductTableCell
          key={column}
          column={column}
          product={product}
          isEditing={isEditing}
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
        onSave={handleSave}
        onCancel={onEditCancel}
        onDelete={onDelete}
        onEdit={() => onEditStart(product)}
      />
    </TableRow>
  );
}