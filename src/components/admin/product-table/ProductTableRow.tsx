import { Tables } from "@/integrations/supabase/types";
import { TableRow } from "@/components/ui/table";
import { ProductTableCell } from "./ProductTableCell";
import { ProductTableActions } from "./ProductTableActions";

type Product = Tables<"products">;

interface ProductTableRowProps {
  product: Product;
  visibleColumns: string[];
  isEditing: boolean;
  editValues: Partial<Product>;
  categories?: { id: string; name: string; }[];
  onEditStart: (product: Product) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (values: Partial<Product>) => void;
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEditSave();
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  };

  return (
    <TableRow 
      key={product.id}
      className="cursor-pointer"
      onClick={() => !isEditing && onEditStart(product)}
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
        onSave={onEditSave}
        onCancel={onEditCancel}
        onDelete={onDelete}
      />
    </TableRow>
  );
}