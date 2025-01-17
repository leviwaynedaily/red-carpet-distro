import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, Grid2X2, Square } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  isSticky: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: 'small' | 'medium' | 'large';
  onViewModeChange: (mode: 'small' | 'medium' | 'large') => void;
  onLogoClick: () => void;
}

export const Header = ({
  isSticky,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onLogoClick,
}: HeaderProps) => {
  const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setTempSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(tempSearchTerm);
      console.log('Searching for:', tempSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm, onSearchChange]);

  return (
    <header className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-50 right-0' : ''}`}>
      <div className="w-full">
        <div className="flex items-center justify-center bg-white px-4 md:px-8">
          {isSticky ? (
            <img
              src="/lovable-uploads/edfd3dc9-231d-4b8e-be61-2d59fa6acac4.png"
              alt="Palmtree Smokes"
              className="h-8 cursor-pointer"
              onClick={onLogoClick}
            />
          ) : null}
        </div>
        <div className={`border-t border-gray-200/30 bg-white ${isSticky ? 'backdrop-blur-sm bg-white/10' : 'bg-white'}`}>
          <div className="flex items-center justify-between py-2 px-4 md:px-8">
            <div className="flex items-center space-x-4 overflow-x-auto">
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[150px] bg-white/80">
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
                <SelectTrigger className="w-[150px] bg-white/80">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="strain-asc">Strain (A-Z)</SelectItem>
                  <SelectItem value="strain-desc">Strain (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search products..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                className="max-w-xs bg-white/80"
              />
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant={viewMode === 'small' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('small')}
                className={`${viewMode === 'small' ? 'bg-secondary hover:bg-secondary/90' : 'bg-white/80'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'medium' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('medium')}
                className={`${viewMode === 'medium' ? 'bg-secondary hover:bg-secondary/90' : 'bg-white/80'}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'large' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('large')}
                className={`${viewMode === 'large' ? 'bg-secondary hover:bg-secondary/90' : 'bg-white/80'}`}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};