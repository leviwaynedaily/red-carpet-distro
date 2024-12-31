import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  isSticky: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const Header = ({
  isSticky,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: HeaderProps) => {
  return (
    <header className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-50' : ''}`}>
      <div className="container mx-auto bg-white">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            {isSticky ? (
              <img
                src="/lovable-uploads/edfd3dc9-231d-4b8e-be61-2d59fa6acac4.png"
                alt="Palmtree Smokes"
                className="h-8"
              />
            ) : null}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {isSticky && (
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4 py-2 overflow-x-auto">
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="flower">Flower</SelectItem>
                  <SelectItem value="edibles">Edibles</SelectItem>
                  <SelectItem value="concentrates">Concentrates</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="potency-asc">Potency (Low to High)</SelectItem>
                  <SelectItem value="potency-desc">Potency (High to Low)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};