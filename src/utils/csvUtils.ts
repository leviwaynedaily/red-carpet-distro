import { Tables } from "@/integrations/supabase/types";
import Papa from 'papaparse';

type Product = Tables<"products">;
type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'media' | 'image_url' | 'video_url'>;

export const parseCSV = (file: File): Promise<ProductInsert[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const products = results.data
          .filter((row: any) => row.name) // Only include rows with a name
          .map((row: any) => ({
            name: row.name, // Required field
            description: row.description || null,
            strain: row.strain || null,
            stock: row.stock ? parseInt(row.stock) : 0,
            regular_price: row.regular_price ? parseFloat(row.regular_price) : 0,
            shipping_price: row.shipping_price ? parseFloat(row.shipping_price) : 0,
            primary_media_type: 'image',
            media: []
          }));
        resolve(products);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const exportProducts = (products: Product[]) => {
  const csv = Papa.unparse(products);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products.csv';
  link.click();
};

export const downloadTemplate = () => {
  const template = [
    {
      name: 'Product Name', // Required field
      description: 'Product Description',
      strain: 'Strain Name',
      stock: '0',
      regular_price: '0.00',
      shipping_price: '0.00'
    }
  ];
  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products_template.csv';
  link.click();
};