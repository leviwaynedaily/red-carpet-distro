import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  strain?: string;
  potency?: string;
  stock?: number;
  regular_price?: number;
  shipping_price?: number;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  'data-product-id'?: string;
}

export const AdminProductCard = ({
  id,
  name,
  description,
  image,
  categories,
  strain,
  potency,
  stock,
  regular_price,
  shipping_price,
  onUpdate,
  onDelete,
  'data-product-id': dataProductId,
}: AdminProductCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name,
    description,
    image,
    categories: categories.join(", "),
    strain,
    potency,
    stock,
    regular_price,
    shipping_price,
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          description: editForm.description,
          image_url: editForm.image,
          categories: editForm.categories.split(",").map(c => c.trim()),
          strain: editForm.strain,
          potency: editForm.potency,
          stock: editForm.stock,
          regular_price: editForm.regular_price,
          shipping_price: editForm.shipping_price,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Product updated successfully");
      setShowEditDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
    }
  };

  return (
    <>
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
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="rounded-full w-8 h-8"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold truncate">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{description}</p>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            {strain && <div>Strain: {strain}</div>}
            {potency && <div>THC: {potency}</div>}
            {stock !== undefined && <div>Stock: {stock}</div>}
            {regular_price !== undefined && <div>Price: ${regular_price}</div>}
            {shipping_price !== undefined && <div>Shipping: ${shipping_price}</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories (comma-separated)</label>
              <Input
                value={editForm.categories}
                onChange={(e) => setEditForm({ ...editForm, categories: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Strain</label>
              <Input
                value={editForm.strain}
                onChange={(e) => setEditForm({ ...editForm, strain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Potency</label>
              <Input
                value={editForm.potency}
                onChange={(e) => setEditForm({ ...editForm, potency: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Regular Price</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.regular_price}
                onChange={(e) => setEditForm({ ...editForm, regular_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Price</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.shipping_price}
                onChange={(e) => setEditForm({ ...editForm, shipping_price: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
