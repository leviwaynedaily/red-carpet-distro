import { ProductTable } from "./ProductTable";
import { ProductMobileGrid } from "./ProductMobileGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Product = Tables<"products">;

interface ProductsListProps {
  searchQuery: string;
  visibleColumns: string[];
  editingProduct: string | null;
  editValues: Partial<Product> & { categories?: string[] };
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onEditStart: (product: Product & { categories?: string[] }) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onDelete: (id: string) => void;
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onDeleteMedia: (productId: string, type: 'image' | 'video') => void;
  onMediaClick: (type: 'image' | 'video', url: string) => void;
  onSort: (key: string) => void;
}

export function ProductsList({
  searchQuery,
  visibleColumns,
  editingProduct,
  editValues,
  sortConfig,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
  onImageUpload,
  onVideoUpload,
  onDeleteMedia,
  onMediaClick,
  onSort,
}: ProductsListProps) {
  const { data: products, isLoading, error } = useProducts();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    console.error('ProductsList: Error loading products:', error);
    toast.error("Failed to load products");
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-500">Error loading products. Please try again.</p>
      </div>
    );
  }

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.strain?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * modifier;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * modifier;
    }
    
    return 0;
  });

  return isMobile ? (
    <ProductMobileGrid
      products={sortedProducts}
      onEditStart={onEditStart}
      onDelete={onDelete}
    />
  ) : (
    <ProductTable
      products={sortedProducts}
      visibleColumns={visibleColumns}
      editingProduct={editingProduct}
      editValues={editValues}
      onEditStart={onEditStart}
      onEditSave={onEditSave}
      onEditCancel={onEditCancel}
      onEditChange={onEditChange}
      onDelete={onDelete}
      onImageUpload={onImageUpload}
      onVideoUpload={onVideoUpload}
      onDeleteMedia={onDeleteMedia}
      onMediaClick={onMediaClick}
      sortConfig={sortConfig}
      onSort={onSort}
    />
  );
}