import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

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
  onMediaClick
}: ProductTableProps) {
  return (
    <div>
      <h2 className="text-lg font-bold">Product Table</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            {visibleColumns.includes("name") && <th>Name</th>}
            {visibleColumns.includes("image") && <th>Image</th>}
            {visibleColumns.includes("video") && <th>Video</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {visibleColumns.includes("name") && <td>{product.name}</td>}
              {visibleColumns.includes("image") && (
                <td>
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover" />
                  )}
                  <FileUpload
                    onUploadComplete={(url) => onImageUpload(product.id, url)}
                    accept="image/*"
                    bucket="media"
                    folderPath={`products/${product.id}`}
                    fileName="image"
                    className="w-8"
                  >
                    <Upload className="h-4 w-4" />
                  </FileUpload>
                </td>
              )}
              {visibleColumns.includes("video") && (
                <td>
                  {product.video_url && (
                    <video controls className="w-16 h-16">
                      <source src={product.video_url} type="video/mp4" />
                    </video>
                  )}
                  <FileUpload
                    onUploadComplete={(url) => onVideoUpload(product.id, url)}
                    accept="video/*"
                    bucket="media"
                    folderPath={`products/${product.id}`}
                    fileName="video"
                    className="w-8"
                  >
                    <Upload className="h-4 w-4" />
                  </FileUpload>
                </td>
              )}
              <td>
                <Button onClick={() => onEditStart(product)}>Edit</Button>
                <Button onClick={() => onDelete(product.id)} variant="outline">Delete</Button>
                <Button onClick={() => onMediaClick('image', product.image_url)} variant="outline">View Image</Button>
                <Button onClick={() => onMediaClick('video', product.video_url)} variant="outline">View Video</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
