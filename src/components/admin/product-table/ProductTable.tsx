import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableRow } from "./ProductTableRow";

type Product = Tables<"products">;

interface ProductTableProps {
  products: (Product & { categories?: string[] })[];
  editingProduct: string | null;
  editValues: Partial<Product> & { categories?: string[] };
  categories?: { id: string; name: string; }[];
  visibleColumns: string[];
  onEditStart: (product: Product & { categories?: string[] }) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onDelete: (id: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

export function ProductTable({
  products,
  editingProduct,
  editValues,
  categories,
  visibleColumns,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
  sortConfig,
  onSort,
}: ProductTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead key={column} className="whitespace-nowrap">
                {column.charAt(0).toUpperCase() + column.slice(1).replace("_", " ")}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductTableRow
              key={product.id}
              product={product}
              visibleColumns={visibleColumns}
              isEditing={editingProduct === product.id}
              editValues={editValues}
              categories={categories}
              onEditStart={onEditStart}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
              onEditChange={onEditChange}
              onDelete={onDelete}
              onImageUpload={(productId, url) => console.log('Upload image:', productId, url)}
              onVideoUpload={(productId, url) => console.log('Upload video:', productId, url)}
              onDeleteMedia={(productId, type) => console.log('Delete media:', productId, type)}
              onMediaClick={(type, url) => console.log('Media clicked:', type, url)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}