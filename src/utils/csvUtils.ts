import { Tables } from "@/integrations/supabase/types";
import Papa from 'papaparse';

type Product = Tables<"products">;

export const exportProducts = (products: Product[]) => {
  const csv = Papa.unparse(products);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products.csv';
  link.click();
};