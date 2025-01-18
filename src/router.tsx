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
  },
]);