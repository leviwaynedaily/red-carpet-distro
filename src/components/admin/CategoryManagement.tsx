import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Upload } from "lucide-react"; // Add this import

interface Category {
  id: string;
  name: string;
  image_url: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } else {
      setCategories(data);
    }
  };

  const handleImageUpload = async (categoryId: string, url: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({ image_url: url })
        .eq("id", categoryId);

      if (error) throw error;
      
      toast.success("Category image updated successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error updating category image:", error);
      toast.error("Failed to update category image");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Category Management</h2>
      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-4 border">
            <span>{category.name}</span>
            <FileUpload
              onUploadComplete={(url) => handleImageUpload(category.id, url)}
              accept="image/*"
              bucket="media"
              folderPath={`categories/${category.id}`}
              fileName="image"
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">Upload Image</div>
              </div>
            </FileUpload>
          </div>
        ))}
      </div>
    </div>
  );
}
