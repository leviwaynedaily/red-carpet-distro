import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image_url: string;
  video_url: string;
}

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } else {
      setProducts(data);
    }
  };

  const handleImageUpload = async (productId: string, url: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ image_url: url })
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product image updated successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product image:", error);
      toast.error("Failed to update product image");
    }
  };

  const handleVideoUpload = async (productId: string, url: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ video_url: url })
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product video updated successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product video:", error);
      toast.error("Failed to update product video");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Product Table</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Video</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover" />
                )}
                <FileUpload
                  onUploadComplete={(url) => handleImageUpload(product.id, url)}
                  accept="image/*"
                  bucket="media"
                  folderPath={`products/${product.id}`}
                  fileName="image"
                  className="w-8"
                >
                  <Upload className="h-4 w-4" />
                </FileUpload>
              </td>
              <td>
                {product.video_url && (
                  <video controls className="w-16 h-16">
                    <source src={product.video_url} type="video/mp4" />
                  </video>
                )}
                <FileUpload
                  onUploadComplete={(url) => handleVideoUpload(product.id, url)}
                  accept="video/*"
                  bucket="media"
                  folderPath={`products/${product.id}`}
                  fileName="video"
                  className="w-8"
                >
                  <Upload className="h-4 w-4" />
                </FileUpload>
              </td>
              <td>
                <Button onClick={() => console.log("Edit product", product.id)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
