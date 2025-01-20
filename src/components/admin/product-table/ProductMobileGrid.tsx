import { Tables } from "@/integrations/supabase/types";
import { AdminProductCard } from "@/components/admin/AdminProductCard";

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
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <AdminProductCard
          key={product.id}
          {...product}
          onUpdate={() => {
            console.log('ProductMobileGrid: Update clicked for product:', product.id);
            onEditStart(product);
          }}
          onDelete={(id) => {
            console.log('ProductMobileGrid: Delete clicked for product:', id);
            onDelete(id);
          }}
          onEdit={() => {
            console.log('ProductMobileGrid: Edit clicked for product:', product.id);
            onEditStart(product);
          }}
          data-product-id={product.id}
        />
      ))}
    </div>
  );
}