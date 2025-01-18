import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { formatPrice } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

type Product = Tables<"products">;

interface ProductTableProps {
  products: Product[];
  visibleColumns: string[];
  editingProduct: string | null;
  editValues: Partial<Product>;
  onEditStart: (product: Product) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (values: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onDeleteMedia: (productId: string, type: 'image' | 'video') => void;
  onMediaClick: (type: 'image' | 'video', url: string) => void;
}

export function ProductTable({
  products,
  visibleColumns,
  editingProduct,
  editValues,
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
  const COLUMNS = [
    { key: "name", label: "Name" },
    { key: "strain", label: "Strain" },
    { key: "description", label: "Description" },
    { key: "image", label: "Image" },
    { key: "video_url", label: "Video" },
    { key: "categories", label: "Categories" },
    { key: "stock", label: "Stock" },
    { key: "regular_price", label: "Price" },
    { key: "shipping_price", label: "Shipping" },
  ];

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleCategoryToggle = (categoryName: string, checked: boolean) => {
    const currentCategories = editValues.categories || [];
    let newCategories;
    
    if (checked) {
      newCategories = [...currentCategories, categoryName];
    } else {
      newCategories = currentCategories.filter(cat => cat !== categoryName);
    }
    
    onEditChange({ categories: newCategories });
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    console.log('Updating field:', field, 'with value:', value);
    // Save the value immediately when it changes
    onEditChange({ [field]: value });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              className="cursor-pointer"
              onClick={() => !editingProduct && onEditStart(product)}
            >
              {visibleColumns.includes('name') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      value={editValues.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.name
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('strain') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      value={editValues.strain || ''}
                      onChange={(e) => handleInputChange('strain', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.strain || '-'
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('description') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      value={editValues.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.description || '-'
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('image') && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.image_url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMediaClick('image', product.image_url!);
                          }}
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </Button>
                        {editingProduct === product.id && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMedia(product.id, 'image');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    {editingProduct === product.id && (
                      <FileUpload
                        onUploadComplete={(url) => onImageUpload(product.id, url)}
                        accept="image/*"
                        bucket="media"
                        folderPath={`products/${product.id}`}
                        fileName="image"
                        className="w-8"
                        buttonContent={<Upload className="h-4 w-4" />}
                      />
                    )}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('video_url') && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.video_url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMediaClick('video', product.video_url!);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        {editingProduct === product.id && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMedia(product.id, 'video');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    {editingProduct === product.id && (
                      <FileUpload
                        onUploadComplete={(url) => onVideoUpload(product.id, url)}
                        accept="video/*"
                        bucket="media"
                        folderPath={`products/${product.id}`}
                        fileName="video"
                        className="w-8"
                        buttonContent={<Upload className="h-4 w-4" />}
                      />
                    )}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('categories') && (
                <TableCell>
                  {editingProduct === product.id ? (
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
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('stock') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      type="number"
                      value={editValues.stock || 0}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    product.stock || '-'
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('regular_price') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      type="number"
                      value={editValues.regular_price || 0}
                      onChange={(e) => handleInputChange('regular_price', parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    formatPrice(product.regular_price)
                  )}
                </TableCell>
              )}
              {visibleColumns.includes('shipping_price') && (
                <TableCell>
                  {editingProduct === product.id ? (
                    <Input
                      type="number"
                      value={editValues.shipping_price || 0}
                      onChange={(e) => handleInputChange('shipping_price', parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    formatPrice(product.shipping_price)
                  )}
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {editingProduct === product.id ? (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSave();
                        }}
                        aria-label="Save changes"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCancel();
                        }}
                        aria-label="Cancel editing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product.id);
                      }}
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
