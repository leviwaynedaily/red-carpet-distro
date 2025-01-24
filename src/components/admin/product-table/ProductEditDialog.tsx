import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { FileUpload } from "@/components/ui/file-upload";
import { Upload, Trash2, Loader2, Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Product = Tables<"products">;

export interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product & { categories: string[] };
  editValues: Partial<Product> & { categories?: string[] };
  onEditChange: (values: Partial<Product> & { categories?: string[] }) => void;
  onSave: () => void;
  onCancel: () => void;
  onMediaUpload: (productId: string, file: File) => Promise<void>;
  onDeleteMedia: (productId: string, type: "image" | "video") => void;
  isSaving?: boolean;
}

export function ProductEditDialog({
  open,
  onOpenChange,
  product,
  editValues,
  onEditChange,
  onSave,
  onCancel,
  onMediaUpload,
  onDeleteMedia,
  isSaving = false,
}: ProductEditDialogProps) {
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
            <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
              {product.categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={editValues.categories?.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
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
            <Label>Media</Label>
            <div className="flex flex-col gap-4">
              {product.image_url && (
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
              )}
              {product.video_url && (
                <div className="flex items-center gap-2">
                  {product.image_url ? (
                    <div className="relative">
                      <img
                        src={product.image_url}
                        alt={`${product.name} preview`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <Play className="absolute inset-0 m-auto h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <video
                      src={product.video_url}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteMedia(product.id, 'video')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <FileUpload
                onUploadComplete={(file) => onMediaUpload(product.id, file)}
                accept="image/*,video/*"
                bucket="media"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Upload an image or video. Videos will automatically generate a thumbnail.
              </p>
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
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}