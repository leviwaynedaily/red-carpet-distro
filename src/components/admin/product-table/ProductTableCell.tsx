import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { FileUpload } from "@/components/ui/file-upload";
import { Play, Upload, Trash2, Image, X } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type Product = Tables<"products">;

export interface ProductTableCellProps {
  key: string;
  column: string;
  product: Product & { categories: string[] };
  isEditing: boolean;
  editValues: Partial<Product> & { categories?: string[] };
  categories?: { id: string; name: string; }[];
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onMediaUpload: (productId: string, file: File) => Promise<void>;
  onDeleteMedia: (productId: string, type: "image" | "video") => void;
  onMediaClick: (type: "image" | "video", url: string) => void;
}

// Add timestamp to URLs to prevent caching
const addVersionToUrl = (url: string) => {
  if (!url) return url;
  const timestamp = new Date().getTime();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

export function ProductTableCell({
  column,
  product,
  isEditing,
  editValues,
  categories,
  onEditChange,
  onMediaUpload,
  onDeleteMedia,
  onMediaClick,
}: ProductTableCellProps) {
  // Fetch current product categories
  const { data: productCategories } = useQuery({
    queryKey: ['product_categories', product.id],
    queryFn: async () => {
      console.log('ProductTableCell: Fetching categories for product:', product.id);
      const { data, error } = await supabase
        .from('product_categories')
        .select('categories(name)')
        .eq('product_id', product.id);

      if (error) {
        console.error('ProductTableCell: Error fetching product categories:', error);
        throw error;
      }

      const categoryNames = data.map(pc => pc.categories?.name).filter(Boolean) as string[];
      console.log('ProductTableCell: Retrieved categories:', categoryNames);
      return categoryNames;
    },
    enabled: isEditing,
  });

  const handleInputChange = (field: keyof Product, value: string | number | string[]) => {
    console.log('ProductTableCell: Updating field:', field, 'with value:', value);
    onEditChange({ ...editValues, [field]: value });
  };

  const handleCategoryChange = (categoryName: string) => {
    console.log('ProductTableCell: Category selected:', categoryName);
    const currentCategories = editValues.categories || productCategories || [];
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(cat => cat !== categoryName)
      : [...currentCategories, categoryName];
    
    onEditChange({ ...editValues, categories: newCategories });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextInput = e.shiftKey 
        ? e.currentTarget.parentElement?.previousElementSibling?.querySelector('input')
        : e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
      if (nextInput instanceof HTMLElement) {
        nextInput.focus();
      }
    }
  };

  const renderCell = (): ReactNode => {
    switch (column) {
      case 'name':
      case 'strain':
      case 'description':
        return isEditing ? (
          <Input
            value={editValues[column as keyof Product]?.toString() || ''}
            onChange={(e) => handleInputChange(column as keyof Product, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          />
        ) : (
          product[column as keyof Product]?.toString() || '-'
        );

      case 'image':
        return (
          <div className="flex items-center gap-2">
            {product.image_url && (
              <div className="relative group">
                <img
                  src={addVersionToUrl(product.image_url)}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                  onClick={() => onMediaClick?.("image", product.image_url!)}
                />
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 hidden group-hover:flex"
                    onClick={() => onDeleteMedia?.(product.id, "image")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            {isEditing && (
              <FileUpload
                onUploadComplete={(file) => onMediaUpload(product.id, file)}
                accept="image/*,video/*"
                bucket="media"
                className="w-[120px]"
              />
            )}
          </div>
        );

      case 'video_url':
        return (
          <div className="flex items-center gap-2">
            {product.video_url && (
              <div className="relative group">
                {product.image_url ? (
                  <div className="relative">
                    <img
                      src={addVersionToUrl(product.image_url)}
                      alt={`${product.name} preview`}
                      className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                      onClick={() => onMediaClick?.("video", product.video_url!)}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <video
                    src={addVersionToUrl(product.video_url)}
                    className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                    onClick={() => onMediaClick?.("video", product.video_url!)}
                  />
                )}
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 hidden group-hover:flex"
                    onClick={() => onDeleteMedia?.(product.id, "video")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'categories':
        return isEditing ? (
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Select
                  value={editValues.categories?.includes(category.name) ? category.name : undefined}
                  onValueChange={() => handleCategoryChange(category.name)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={category.name} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={category.name}>{category.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        ) : (
          <div>{product.categories?.join(", ") || '-'}</div>
        );

      case 'stock':
        return isEditing ? (
          <Input
            type="number"
            value={editValues.stock?.toString() || '0'}
            onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          />
        ) : (
          product.stock?.toString() || '-'
        );

      case 'regular_price':
      case 'shipping_price':
        return isEditing ? (
          <Input
            type="number"
            value={editValues[column as keyof Product]?.toString() || '0'}
            onChange={(e) => handleInputChange(column as keyof Product, parseFloat(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          />
        ) : (
          formatPrice(product[column as keyof Product] as number)
        );

      default:
        return null;
    }
  };

  return (
    <TableCell onClick={(e) => e.stopPropagation()}>
      {renderCell()}
    </TableCell>
  );
}