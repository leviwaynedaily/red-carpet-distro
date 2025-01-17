import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminProductCard } from "./AdminProductCard";
import { CategoryManagement } from "./CategoryManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutGrid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Product = Tables<"products">;

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <CategoryManagement />
        <div className="flex flex-col w-full md:w-auto gap-2">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
          {!isMobile && (
            <div className="flex justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    {viewMode === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode("grid")}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("table")}>
                    <List className="mr-2 h-4 w-4" />
                    Table View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {viewMode === "grid" || isMobile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description || ""}
              image={product.image_url || ""}
              categories={product.categories || []}
              strain={product.strain}
              stock={product.stock}
              regular_price={product.regular_price}
              shipping_price={product.shipping_price}
              onUpdate={fetchProducts}
              onDelete={handleDeleteProduct}
              onEdit={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    {product.categories?.join(", ")}
                  </TableCell>
                  <TableCell>
                    <AdminProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description || ""}
                      image={product.image_url || ""}
                      categories={product.categories || []}
                      strain={product.strain}
                      stock={product.stock}
                      regular_price={product.regular_price}
                      shipping_price={product.shipping_price}
                      onUpdate={fetchProducts}
                      onDelete={handleDeleteProduct}
                      onEdit={() => {}}
                      data-product-id={product.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}