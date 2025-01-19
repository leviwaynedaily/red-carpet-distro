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
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onDeleteMedia: (productId: string, type: 'image' | 'video') => void;
  onMediaClick: (type: 'image' | 'video', url: string) => void;
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
  onImageUpload,
  onVideoUpload,
  onDeleteMedia,
  onMediaClick,
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
              onImageUpload={onImageUpload}
              onVideoUpload={onVideoUpload}
              onDeleteMedia={onDeleteMedia}
              onMediaClick={onMediaClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}