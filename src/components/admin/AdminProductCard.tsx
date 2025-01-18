import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Image, Play, Upload } from "lucide-react";

type Product = Tables<"products">;

interface AdminProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onMediaClick: (type: 'image' | 'video', url: string) => void;
  isEditing: boolean;
  editValues: Partial<Product>;
  onEditChange: (values: Partial<Product>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

export function AdminProductCard({
  product,
  onEdit,
  onDelete,
  onImageUpload,
  onVideoUpload,
  onMediaClick,
  isEditing,
  editValues,
  onEditChange,
  onEditSave,
  onEditCancel
}: AdminProductCardProps) {
  const handleChange = (field: keyof Product, value: any) => {
    onEditChange({ ...editValues, [field]: value });
  };

  const renderImage = () => {
    if (!product.image_url && (!product.media || typeof product.media !== 'object' || !('webp' in product.media))) {
      return (
        <div className="aspect-square flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Image coming soon</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="aspect-square cursor-pointer"
        onClick={() => onMediaClick('image', product.image_url || '')}
      >
        <picture>
          {product.media && typeof product.media === 'object' && 'webp' in product.media && (
            <source srcSet={product.media.webp as string} type="image/webp" />
          )}
          <img
            src={product.image_url || ''}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </picture>
      </div>
    );
  };

  if (isEditing) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <Input
            value={editValues.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Product name"
          />
          <Textarea
            value={editValues.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description"
          />
          <Input
            value={editValues.strain || ''}
            onChange={(e) => handleChange('strain', e.target.value)}
            placeholder="Strain"
          />
          <Input
            type="number"
            value={editValues.regular_price || ''}
            onChange={(e) => handleChange('regular_price', parseFloat(e.target.value))}
            placeholder="Price"
          />
          <Input
            type="number"
            value={editValues.shipping_price || ''}
            onChange={(e) => handleChange('shipping_price', parseFloat(e.target.value))}
            placeholder="Shipping"
          />
          <Input
            type="number"
            value={editValues.stock || ''}
            onChange={(e) => handleChange('stock', parseInt(e.target.value))}
            placeholder="Stock"
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4">
          <Button variant="outline" onClick={onEditCancel}>Cancel</Button>
          <Button onClick={onEditSave}>Save</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {renderImage()}
      <CardContent className="p-4">
        <div className="mb-2">
          {product.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="mr-1">
              {category}
            </Badge>
          ))}
        </div>
        <h3 className="font-semibold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        {product.strain && (
          <p className="text-sm text-gray-600">Strain: {product.strain}</p>
        )}
        <div className="mt-2">
          {product.regular_price && (
            <p className="font-medium">${product.regular_price}</p>
          )}
          {product.shipping_price && (
            <p className="text-sm text-gray-600">+${product.shipping_price} shipping</p>
          )}
          {product.stock && (
            <p className="text-sm text-gray-600">{product.stock} in stock</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-wrap gap-2">
        <FileUpload
          onUploadComplete={(url) => onImageUpload(product.id, url)}
          accept="image/*"
          bucket="media"
          folderPath={`products/${product.id}`}
          fileName="image"
        >
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Image
          </Button>
        </FileUpload>
        <FileUpload
          onUploadComplete={(url) => onVideoUpload(product.id, url)}
          accept="video/*"
          bucket="media"
          folderPath={`products/${product.id}`}
          fileName="video"
        >
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Video
          </Button>
        </FileUpload>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}