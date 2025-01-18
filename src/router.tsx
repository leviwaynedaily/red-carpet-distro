import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";

console.log('router.tsx: Initializing router configuration');

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/products/:id",
    element: <ProductDetails />,
    errorElement: <div className="container mx-auto px-4 py-8">
      <p className="text-red-500">Error: Could not load product details. Please try again later.</p>
    </div>
  },
]);