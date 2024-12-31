import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, List, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  isSticky: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: 'grid' | 'list' | 'compact';
  onViewModeChange: (mode: 'grid' | 'list' | 'compact') => void;
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
}: HeaderProps) => {
  const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);

  // Update tempSearchTerm when searchTerm prop changes
  useEffect(() => {
    setTempSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    onSearchChange(tempSearchTerm);
    console.log('Searching for:', tempSearchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-50 right-0' : ''}`}>
      <div className="w-full">
        <div className="flex items-center justify-between py-4 bg-white px-4 md:px-8">
          <div className="flex items-center space-x-4">
            {isSticky ? (
              <img
                src="/lovable-uploads/edfd3dc9-231d-4b8e-be61-2d59fa6acac4.png"
                alt="Palmtree Smokes"
                className="h-8"
              />
            ) : null}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleSearch}>
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
          <div className="border-t border-gray-200/30 bg-white/10 backdrop-blur-sm">
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
                    <SelectItem value="potency-asc">Potency (Low to High)</SelectItem>
                    <SelectItem value="potency-desc">Potency (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search products..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="max-w-xs bg-white/80"
                />
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => onViewModeChange('grid')}
                  className="bg-white/80"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => onViewModeChange('list')}
                  className="bg-white/80"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => onViewModeChange('compact')}
                  className="bg-white/80"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};