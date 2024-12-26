import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Temporary product data
const TEMP_PRODUCTS = [
  {
    id: 1,
    name: "Purple Haze",
    description: "A classic sativa-dominant hybrid with sweet and earthy notes",
    image: "https://images.unsplash.com/photo-1603034203013-d532350372c6?q=80&w=1000",
    categories: ["Flower", "Sativa"],
    strain: "Sativa",
    potency: "22%",
  },
  {
    id: 2,
    name: "OG Kush",
    description: "Known for its potent effects and unique terpene profile",
    image: "https://images.unsplash.com/photo-1603034203013-d532350372c6?q=80&w=1000",
    categories: ["Flower", "Indica"],
    strain: "Indica",
    potency: "24%",
  },
  // Add more products as needed
];

export const ProductGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const filteredProducts = TEMP_PRODUCTS.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter ||
      product.categories.some((cat) =>
        cat.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "potency-asc")
      return (
        parseInt(a.potency?.replace("%", "") || "0") -
        parseInt(b.potency?.replace("%", "") || "0")
      );
    if (sortBy === "potency-desc")
      return (
        parseInt(b.potency?.replace("%", "") || "0") -
        parseInt(a.potency?.replace("%", "") || "0")
      );
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="flower">Flower</SelectItem>
            <SelectItem value="edibles">Edibles</SelectItem>
            <SelectItem value="concentrates">Concentrates</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="potency-asc">Potency (Low to High)</SelectItem>
            <SelectItem value="potency-desc">Potency (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};