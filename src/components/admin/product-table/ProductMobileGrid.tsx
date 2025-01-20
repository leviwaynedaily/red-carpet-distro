import { Tables } from "@/integrations/supabase/types";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { ProductEditDialog } from "./ProductEditDialog";
import { useState } from "react";
import { toast } from "sonner";

type Product = Tables<"products">;

interface ProductMobileGridProps {
  products: (Product & { categories?: string[] })[];
  onEditStart: (product: Product & { categories?: string[] }) => void;
  onDelete: (id: string) => void;
}

export function ProductMobileGrid({
  products,
  onEditStart,
  onDelete,
}: ProductMobileGridProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { categories?: string[] }) | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product> & { categories?: string[] }>({});

  const handleEditStart = (product: Product & { categories?: string[] }) => {
    console.log('ProductMobileGrid: Starting edit for product:', product.id);
    setSelectedProduct(product);
    setEditValues(product);
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    console.log('ProductMobileGrid: Saving edit for product:', selectedProduct?.id);
    if (selectedProduct) {
      onEditStart(selectedProduct);
      setShowEditDialog(false);
      setSelectedProduct(null);
      setEditValues({});
      toast.success('Product updated successfully');
    }
  };

  const handleEditCancel = () => {
    console.log('ProductMobileGrid: Canceling edit');
    setShowEditDialog(false);
    setSelectedProduct(null);
    setEditValues({});
  };

  const handleDelete = (id: string) => {
    console.log('ProductMobileGrid: Deleting product:', id);
    onDelete(id);
    toast.success('Product deleted successfully');
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <AdminProductCard
            key={product.id}
            {...product}
            onUpdate={() => {
              console.log('ProductMobileGrid: Update clicked for product:', product.id);
              handleEditStart(product);
            }}
            onDelete={(id) => {
              console.log('ProductMobileGrid: Delete clicked for product:', id);
              handleDelete(id);
            }}
            onEdit={() => {
              console.log('ProductMobileGrid: Edit clicked for product:', product.id);
              handleEditStart(product);
            }}
            data-product-id={product.id}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={selectedProduct}
          editValues={editValues}
          onEditChange={setEditValues}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          onImageUpload={(productId, url) => console.log('Upload image:', productId, url)}
          onVideoUpload={(productId, url) => console.log('Upload video:', productId, url)}
          onDeleteMedia={(productId, type) => console.log('Delete media:', productId, type)}
        />
      )}
    </>
  );
}