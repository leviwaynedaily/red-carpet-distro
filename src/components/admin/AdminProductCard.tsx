import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface AdminProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  strain?: string;
  stock?: number;
  regular_price?: number;
  shipping_price?: number;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  'data-product-id'?: string;
}

export const AdminProductCard = ({
  id,
  name,
  description,
  image,
  categories,
  strain,
  stock,
  regular_price,
  shipping_price,
  onDelete,
  onEdit,
  'data-product-id': dataProductId,
}: AdminProductCardProps) => {
  return (
    <Card 
      className="overflow-hidden"
      data-product-id={dataProductId}
    >
      <CardHeader className="p-0 relative aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-8 h-8"
            onClick={onEdit}
            aria-label="Edit product"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="rounded-full w-8 h-8"
            onClick={() => onDelete(id)}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-bold truncate">{name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: description.replace(/,/g, ', ') }} />
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          {categories?.length > 0 && (
            <div>Categories: {categories.join(', ')}</div>
          )}
          {strain && <div>Strain: {strain}</div>}
          {stock !== undefined && <div>Stock: {stock}</div>}
          {regular_price !== undefined && <div>Price: ${regular_price}</div>}
          {shipping_price !== undefined && <div>Shipping: ${shipping_price}</div>}
        </div>
      </CardContent>
    </Card>
  );
};