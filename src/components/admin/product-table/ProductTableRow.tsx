import { Tables } from "@/integrations/supabase/types";
import { TableRow } from "@/components/ui/table";
import { ProductTableCell } from "./ProductTableCell";
import { ProductTableActions } from "./ProductTableActions";
import { ProductEditDialog } from "./ProductEditDialog";
import { useState } from "react";
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
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    onEditStart(product);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    await onEditSave();
    setShowEditDialog(false);
  };

  const handleCancel = () => {
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