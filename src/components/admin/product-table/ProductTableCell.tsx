import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { FileUpload } from "@/components/ui/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Upload, Trash2 } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

type Product = Tables<"products">;

interface ProductTableCellProps {
  column: string;
  product: Product;
  isEditing: boolean;
  editValues: Partial<Product>;
  categories?: { id: string; name: string; }[];
  onEditChange: (values: Partial<Product>) => void;
  onMediaClick?: (type: 'image' | 'video', url: string) => void;
  onDeleteMedia?: (productId: string, type: 'image' | 'video') => void;
  onImageUpload?: (productId: string, url: string) => void;
  onVideoUpload?: (productId: string, url: string) => void;
}

export function ProductTableCell({
  column,
  product,
  isEditing,
  editValues,
  categories,
  onEditChange,
  onMediaClick,
  onDeleteMedia,
  onImageUpload,
  onVideoUpload,
}: ProductTableCellProps) {
  const handleInputChange = (field: keyof Product, value: any) => {
    console.log('ProductTableCell: Updating field:', field, 'with value:', value);
    onEditChange({ ...editValues, [field]: value });
  };

  const handleCategoryToggle = (categoryName: string, checked: boolean) => {
    const currentCategories = editValues.categories || [];
    let newCategories;
    
    if (checked) {
      newCategories = [...currentCategories, categoryName];
    } else {
      newCategories = currentCategories.filter(cat => cat !== categoryName);
    }
    
    onEditChange({ ...editValues, categories: newCategories });
  };

  const renderCell = () => {
    switch (column) {
      case 'name':
      case 'strain':
      case 'description':
        return isEditing ? (
          <Input
            value={editValues[column as keyof Product] || ''}
            onChange={(e) => handleInputChange(column as keyof Product, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          product[column as keyof Product] || '-'
        );

      case 'image':
        return (
          <div className="flex items-center gap-2">
            {product.image_url && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMediaClick?.('image', product.image_url!);
                  }}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </Button>
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMedia?.(product.id, 'image');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            {isEditing && (
              <FileUpload
                onUploadComplete={(url) => onImageUpload?.(product.id, url)}
                accept="image/*"
                bucket="media"
                folderPath={`products/${product.id}`}
                fileName="image"
                className="w-8"
                buttonContent={<Upload className="h-4 w-4" />}
              />
            )}
          </div>
        );

      case 'video_url':
        return (
          <div className="flex items-center gap-2">
            {product.video_url && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMediaClick?.('video', product.video_url!);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMedia?.(product.id, 'video');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            {isEditing && (
              <FileUpload
                onUploadComplete={(url) => onVideoUpload?.(product.id, url)}
                accept="video/*"
                bucket="media"
                folderPath={`products/${product.id}`}
                fileName="video"
                className="w-8"
                buttonContent={<Upload className="h-4 w-4" />}
              />
            )}
          </div>
        );

      case 'categories':
        return isEditing ? (
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={(editValues.categories || []).includes(category.name)}
                  onCheckedChange={(checked) => 
                    handleCategoryToggle(category.name, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
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
            value={editValues.stock || 0}
            onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          product.stock || '-'
        );

      case 'regular_price':
      case 'shipping_price':
        return isEditing ? (
          <Input
            type="number"
            value={editValues[column as keyof Product] || 0}
            onChange={(e) => handleInputChange(column as keyof Product, parseFloat(e.target.value))}
            onClick={(e) => e.stopPropagation()}
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