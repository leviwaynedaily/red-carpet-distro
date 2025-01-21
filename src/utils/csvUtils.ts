import { Tables } from "@/integrations/supabase/types";
import Papa from 'papaparse';

type Product = Tables<"products">;

export const parseCSV = (file: File): Promise<Partial<Product>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const products = results.data.map(row => ({
          name: row.name || '', // Ensure name is always present
          description: row.description,
          strain: row.strain,
          stock: row.stock ? parseInt(row.stock) : 0,
          regular_price: row.regular_price ? parseFloat(row.regular_price) : 0,
          shipping_price: row.shipping_price ? parseFloat(row.shipping_price) : 0,
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
      name: 'Product Name',
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