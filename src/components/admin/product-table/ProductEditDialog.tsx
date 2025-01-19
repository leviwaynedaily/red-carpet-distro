import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { FileUpload } from "@/components/ui/file-upload";
import { Upload, Trash2, Check } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Product = Tables<"products">;

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  editValues: Partial<Product> & { categories?: string[] };
  categories?: { id: string; name: string }[];
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (productId: string, url: string) => void;
  onVideoUpload: (productId: string, url: string) => void;
  onDeleteMedia: (productId: string, type: 'image' | 'video') => void;
}

export function ProductEditDialog({
  open,
  onOpenChange,
  product,
  editValues,
  categories = [],
  onEditChange,
  onSave,
  onCancel,
  onImageUpload,
  onVideoUpload,
  onDeleteMedia,
}: ProductEditDialogProps) {
  const [openCategories, setOpenCategories] = useState(false);

  const handleCategoryToggle = (categoryName: string) => {
    console.log('ProductEditDialog: Category toggled:', categoryName);
    const currentCategories = editValues.categories || [];
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(cat => cat !== categoryName)
      : [...currentCategories, categoryName];
    onEditChange({ ...editValues, categories: newCategories });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editValues.name || ''}
              onChange={(e) => onEditChange({ ...editValues, name: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="strain">Strain</Label>
            <Input
              id="strain"
              value={editValues.strain || ''}
              onChange={(e) => onEditChange({ ...editValues, strain: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editValues.description || ''}
              onChange={(e) => onEditChange({ ...editValues, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Categories</Label>
            <Popover open={openCategories} onOpenChange={setOpenCategories}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategories}
                  className="justify-between"
                >
                  {editValues.categories?.length 
                    ? `${editValues.categories.length} categories selected`
                    : "Select categories..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        onSelect={() => handleCategoryToggle(category.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            editValues.categories?.includes(category.name)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {editValues.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {editValues.categories.map((category) => (
                  <div
                    key={category}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Image</Label>
            <div className="flex items-center gap-2">
              {product.image_url ? (
                <div className="flex items-center gap-2">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteMedia(product.id, 'image')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              <FileUpload
                onUploadComplete={(url) => onImageUpload(product.id, url)}
                accept="image/*"
                bucket="media"
                folderPath={`products/${product.id}`}
                fileName="image"
                className="w-8"
                buttonContent={<Upload className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Video</Label>
            <div className="flex items-center gap-2">
              {product.video_url ? (
                <div className="flex items-center gap-2">
                  <video
                    src={product.video_url}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteMedia(product.id, 'video')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              <FileUpload
                onUploadComplete={(url) => onVideoUpload(product.id, url)}
                accept="video/*"
                bucket="media"
                folderPath={`products/${product.id}`}
                fileName="video"
                className="w-8"
                buttonContent={<Upload className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={editValues.stock?.toString() || '0'}
              onChange={(e) => onEditChange({ ...editValues, stock: parseInt(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="regular_price">Regular Price</Label>
            <Input
              id="regular_price"
              type="number"
              step="0.01"
              value={editValues.regular_price?.toString() || '0'}
              onChange={(e) => onEditChange({ ...editValues, regular_price: parseFloat(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shipping_price">Shipping Price</Label>
            <Input
              id="shipping_price"
              type="number"
              step="0.01"
              value={editValues.shipping_price?.toString() || '0'}
              onChange={(e) => onEditChange({ ...editValues, shipping_price: parseFloat(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
