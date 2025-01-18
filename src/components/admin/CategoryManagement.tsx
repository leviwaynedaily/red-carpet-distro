import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { convertToWebP } from "@/utils/imageUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CategoryManagement() {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showMedia, setShowMedia] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      console.log("Categories fetched:", data);
      return data;
    },
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      console.log("Adding new category:", newCategory);
      const { error } = await supabase
        .from("categories")
        .insert([{ name: newCategory.trim() }]);

      if (error) {
        console.error("Error adding category:", error);
        if (error.code === '23505') {
          toast.error("A category with this name already exists");
        } else {
          toast.error("Failed to add category: " + error.message);
        }
        return;
      }

      toast.success("Category added successfully");
      setNewCategory("");
      refetch();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editingName.trim() })
        .eq("id", id);

      if (error) {
        console.error("Error updating category:", error);
        if (error.code === '23505') {
          toast.error("A category with this name already exists");
        } else {
          toast.error("Failed to update category: " + error.message);
        }
        return;
      }

      toast.success("Category updated successfully");
      setEditingId(null);
      setEditingName("");
      refetch();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log("Deleting category:", id);
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category: " + error.message);
        return;
      }

      toast.success("Category deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleImageUpload = async (categoryId: string, url: string) => {
    try {
      console.log('🚀 Starting image upload process for category:', categoryId);
      
      // Find the category to get its name
      const category = categories?.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Create a sanitized filename from the category name
      const sanitizedName = category.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Fetch the uploaded file
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${sanitizedName}.${url.split('.').pop()}`, { type: blob.type });

      console.log('📦 Original file details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Convert to WebP
      console.log('🔄 Converting image to WebP format');
      const { webpBlob } = await convertToWebP(file);
      const webpFile = new File([webpBlob], `${sanitizedName}.webp`, { type: 'image/webp' });

      console.log('📦 WebP file details:', {
        name: webpFile.name,
        type: webpFile.type,
        size: webpFile.size
      });

      // Upload WebP version only
      const webpPath = `categories/${categoryId}/${sanitizedName}.webp`;
      const { error: webpError, data: webpData } = await supabase.storage
        .from('media')
        .upload(webpPath, webpFile, {
          contentType: 'image/webp',
          upsert: true
        });

      if (webpError) {
        console.error('❌ Error uploading WebP version:', webpError);
        throw webpError;
      }

      console.log('✅ WebP version uploaded successfully');

      // Get public URL for WebP
      const { data: { publicUrl: webpUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(webpPath);

      console.log('🔗 Generated WebP URL:', webpUrl);

      // Update category record with WebP URL only
      const { error: updateError } = await supabase
        .from("categories")
        .update({ 
          image_url: webpUrl,
          media: {
            webp: webpUrl
          }
        })
        .eq("id", categoryId);

      if (updateError) {
        console.error('❌ Error updating category record:', updateError);
        throw updateError;
      }

      console.log('✅ Category record updated successfully');
      toast.success("Image uploaded successfully");
      refetch();
    } catch (error) {
      console.error("Error updating category image:", error);
      toast.error("Failed to update category image");
    }
  };

  const handleDeleteImage = async (categoryId: string) => {
    try {
      const category = categories?.find(c => c.id === categoryId);
      if (!category) return;

      // Delete from storage first
      if (category.image_url) {
        const filePathParts = category.image_url.split('/');
        const fileName = filePathParts[filePathParts.length - 1];
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([`categories/${categoryId}/${fileName}`]);

        if (storageError) throw storageError;
      }

      // Update category record
      const { error: dbError } = await supabase
        .from("categories")
        .update({ 
          image_url: null,
          media: null
        })
        .eq("id", categoryId);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const startEditing = (category: { id: string; name: string }) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex flex-col p-4 border rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              {editingId === category.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCategory(category.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{category.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="relative group">
              {category.image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedImage(category.image_url);
                      setShowMedia(true);
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <FileUpload
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        handleImageUpload(category.id, res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                  >
                    <Button variant="ghost" className="w-full h-full">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </Button>
                  </FileUpload>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showMedia} onOpenChange={setShowMedia}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Category"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}