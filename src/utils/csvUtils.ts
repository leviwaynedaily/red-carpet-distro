import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type ProductWithCategories = Product & { categories?: string[] };

const TEMPLATE_HEADERS = [
  "name",
  "description",
  "strain",
  "stock",
  "regular_price",
  "shipping_price",
  "categories"
];

export const downloadTemplate = () => {
  const csvContent = [
    TEMPLATE_HEADERS.join(","),
    'Example Product,Product Description,Hybrid,10,29.99,5.99,"Category1, Category2"'
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "product_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProducts = (products: ProductWithCategories[]) => {
  const csvContent = [
    TEMPLATE_HEADERS.join(","),
    ...products.map((product) => {
      return [
        product.name,
        product.description || "",
        product.strain || "",
        product.stock || 0,
        product.regular_price || 0,
        product.shipping_price || 0,
        (product.categories || []).join(", ")
      ]
        .map((value) => `"${value}"`)
        .join(",");
    }),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "products.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = async (file: File): Promise<Partial<ProductWithCategories>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0]
          .split(",")
          .map((header) => header.trim().toLowerCase().replace(/^"|"$/g, ""));

        const products = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            const product: Partial<ProductWithCategories> = {
              name: values[headers.indexOf("name")],
            };

            headers.forEach((header, index) => {
              if (header === "categories") {
                product.categories = values[index]?.split(",").map((c) => c.trim()) || [];
              } else if (["stock", "regular_price", "shipping_price"].includes(header)) {
                const value = parseFloat(values[index]) || 0;
                product[header as keyof Product] = value;
              } else {
                const value = values[index];
                if (value) {
                  product[header as keyof Product] = value;
                }
              }
            });

            return product;
          });

        resolve(products);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};