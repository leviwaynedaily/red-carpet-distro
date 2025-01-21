import { Tables } from "@/integrations/supabase/types";
import Papa from 'papaparse';

type Product = Tables<"products">;

// Define a type for product insertion that requires name
type ProductInsert = {
  name: string; // Required field
  description?: string | null;
  strain?: string | null;
  stock?: number | null;
  regular_price?: number | null;
  shipping_price?: number | null;
  primary_media_type?: string | null;
  media?: any[] | null;
};

export const parseCSV = (file: File): Promise<ProductInsert[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('CSV Parser: Raw results:', results.data);
        
        const products = results.data
          .filter((row: any) => {
            const hasName = row.name && typeof row.name === 'string';
            if (!hasName) {
              console.warn('CSV Parser: Skipping row without name:', row);
            }
            return hasName;
          })
          .map((row: any) => ({
            name: row.name.trim(), // Required field, ensure it's trimmed
            description: row.description || null,
            strain: row.strain || null,
            stock: row.stock ? parseInt(row.stock) : 0,
            regular_price: row.regular_price ? parseFloat(row.regular_price) : 0,
            shipping_price: row.shipping_price ? parseFloat(row.shipping_price) : 0,
            primary_media_type: 'image',
            media: []
          }));
        
        console.log('CSV Parser: Transformed products:', products);
        resolve(products);
      },
      error: (error) => {
        console.error('CSV Parser: Error parsing file:', error);
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