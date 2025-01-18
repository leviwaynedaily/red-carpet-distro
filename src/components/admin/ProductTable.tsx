import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Pencil, Trash2, X, Check, Image, Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    onEditChange({ ...editValues, categories: newCategories });
  };

  // Initialize selected categories when starting to edit
  const handleEditStart = (product: Product) => {
    setSelectedCategories(product.categories || []);
    onEditStart(product);
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex justify-between items-start">
            {editingProduct === product.id ? (
              <div className="space-y-4 w-full">
                {visibleColumns.includes("name") && (
                  <Input
                    value={editValues.name || ""}
                    onChange={(e) =>
                      onEditChange({ ...editValues, name: e.target.value })
                    }
                    placeholder="Product name"
                  />
                )}

                {visibleColumns.includes("categories") && categories && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                          onClick={() => handleCategoryChange(category.id)}
                          className="text-sm"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  value={editValues.description || ""}
                  onChange={(e) =>
                    onEditChange({ ...editValues, description: e.target.value })
                  }
                  placeholder="Product description"
                />

                <Input
                  value={editValues.strain || ""}
                  onChange={(e) =>
                    onEditChange({ ...editValues, strain: e.target.value })
                  }
                  placeholder="Product strain"
                />

                <div className="flex justify-end gap-2">
                  <Button onClick={onEditSave}>
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={onEditCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 flex-1">
                  {visibleColumns.includes("name") && (
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                  )}
                  
                  {visibleColumns.includes("categories") && categories && (
                    <div className="flex flex-wrap gap-2">
                      {product.categories?.map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <span
                            key={category.id}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  <p>{product.description}</p>
                  <p>{product.strain}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditStart(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <FileUpload onUpload={(url) => onImageUpload(product.id, url)} />
            <FileUpload onUpload={(url) => onVideoUpload(product.id, url)} />
          </div>
        </div>
      ))}
    </div>
  );
}
