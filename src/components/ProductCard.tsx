import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, X, Image, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  video?: string;
  categories: string[];
  strain?: string;
  potency?: string;
  stock?: number;
  regular_price?: number;
  shipping_price?: number;
  viewMode: 'small' | 'medium' | 'large';
  onUpdate?: () => void;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  video,
  categories,
  strain,
  potency,
  stock,
  regular_price,
  shipping_price,
  viewMode,
  onUpdate,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMedia, setShowMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setIsAdmin(roles?.role === 'admin');
      }
    };

    checkAdminStatus();
  }, []);

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMedia(true);
    if (video && showVideo) setIsPlaying(true);
  };

  const handleClose = () => {
    setShowMedia(false);
    setIsPlaying(false);
    setShowVideo(false);
  };

  const toggleMediaType = () => {
    setShowVideo(!showVideo);
    setIsPlaying(!showVideo);
  };

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
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
    }
  };

  const cardClasses = {
    small: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    medium: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
    large: "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
  };

  const imageClasses = {
    small: "w-full h-full object-cover",
    medium: "w-full h-full object-cover",
    large: "w-full h-full object-cover"
  };

  const contentClasses = {
    small: "p-2",
    medium: "p-3",
    large: "p-4"
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <>
      <Card 
        className={cardClasses[viewMode]}
        onClick={handleCardClick}
      >
        <CardHeader className="p-0 relative aspect-square">
          <img
            src={image}
            alt={name}
            className={imageClasses[viewMode]}
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            {video && (
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full w-6 h-6"
                onClick={handleMediaClick}
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            {isAdmin && (
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDialog(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={contentClasses[viewMode]}>
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-sm font-semibold mb-1 truncate">{name}</h3>
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}
          {(strain || potency) && (
            <div className="flex gap-2 text-xs text-gray-600 mt-2">
              {strain && <span>Strain: {strain}</span>}
              {potency && <span>THC: {potency}</span>}
            </div>
          )}
          <div className="mt-2 space-y-1">
            {regular_price !== undefined && regular_price > 0 && (
              <div className="text-sm font-medium">
                {formatPrice(regular_price)}
              </div>
            )}
            {shipping_price !== undefined && shipping_price > 0 && (
              <div className="text-xs text-gray-600">
                + {formatPrice(shipping_price)} shipping
              </div>
            )}
            {stock !== undefined && stock > 0 && (
              <div className="text-xs text-gray-600">
                {stock} in stock
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            {video && (
              <Toggle
                pressed={showVideo}
                onPressedChange={toggleMediaType}
                size="sm"
                className="bg-white/90 hover:bg-white"
              >
                {showVideo ? <Play className="h-4 w-4" /> : <Image className="h-4 w-4" />}
              </Toggle>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {(video && showVideo) ? (
            <video
              src={video}
              controls
              autoPlay={isPlaying}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {isAdmin && (
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
      )}
    </>
  );
};
