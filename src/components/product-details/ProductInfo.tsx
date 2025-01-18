import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  name: string;
  description?: string;
  categories?: string[];
  strain?: string;
  regularPrice?: number;
  shippingPrice?: number;
  stock?: number;
}

export const ProductInfo = ({
  name,
  description,
  categories,
  strain,
  regularPrice,
  shippingPrice,
  stock,
}: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      {categories?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {strain && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Strain</h3>
          <p>{strain}</p>
        </div>
      )}

      {(regularPrice !== undefined && regularPrice > 0) && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Price</h3>
          <p className="text-2xl font-bold">
            ${regularPrice.toFixed(2)}
          </p>
          {(shippingPrice !== undefined && shippingPrice > 0) && (
            <p className="text-sm text-gray-600">
              + ${shippingPrice.toFixed(2)} shipping
            </p>
          )}
        </div>
      )}

      {(stock !== undefined && stock > 0) && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Stock</h3>
          <p>{stock} available</p>
        </div>
      )}
    </div>
  );
};