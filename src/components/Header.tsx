import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types";

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

interface HeaderProps {
  isSticky: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onLogoClick: () => void;
}

export const Header = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  onLogoClick,
}: HeaderProps) => {
  const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);
  const [headerColor, setHeaderColor] = useState('#FFFFFF');
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [toolbarColor, setToolbarColor] = useState('#FFFFFF');
  const [toolbarOpacity, setToolbarOpacity] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWebpUrl, setLogoWebpUrl] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const { data: settings, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error fetching site settings:', error);
          return;
        }

        if (settings) {
          const typedSettings = settings as SiteSettings;
          setHeaderColor(typedSettings.header_color || '#FFFFFF');
          setHeaderOpacity(typedSettings.header_opacity || 1);
          setToolbarColor(typedSettings.toolbar_color || '#FFFFFF');
          setToolbarOpacity(typedSettings.toolbar_opacity || 1);
          setLogoUrl(typedSettings.logo_url || 'https://fwsdoiaodphgyeteafbq.supabase.co/storage/v1/object/public/media/sitesettings/logo.png');
          
          // Check if media exists and contains webp property
          if (typedSettings.media && typeof typedSettings.media === 'object' && 'webp' in typedSettings.media) {
            setLogoWebpUrl(typedSettings.media.webp as string);
          }
        }
      } catch (error) {
        console.error('Error in fetchHeaderSettings:', error);
      }
    };

    fetchHeaderSettings();
  }, []);

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

  const headerStyle = {
    backgroundColor: headerColor ? `${headerColor}${Math.round(headerOpacity * 255).toString(16).padStart(2, '0')}` : '#FFFFFF',
  };

  const toolbarStyle = {
    backgroundColor: toolbarColor ? `${toolbarColor}${Math.round(toolbarOpacity * 255).toString(16).padStart(2, '0')}` : '#FFFFFF',
  };

  const FilterControls = () => (
    <>
      <Select value={categoryFilter} onValueChange={(value) => {
        onCategoryChange(value);
        if (isMobile) setIsSheetOpen(false);
      }}>
        <SelectTrigger className="w-full md:w-[150px] bg-white/80">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="flower">Flower</SelectItem>
          <SelectItem value="edibles">Edibles</SelectItem>
          <SelectItem value="concentrates">Concentrates</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={(value) => {
        onSortChange(value);
        if (isMobile) setIsSheetOpen(false);
      }}>
        <SelectTrigger className="w-full md:w-[150px] bg-white/80">
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
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full shadow-sm" style={headerStyle}>
      <div className="w-full">
        <div className="flex items-center justify-center px-4 md:px-8 py-4 md:py-6 backdrop-blur-sm bg-white/10">
          <picture>
            {logoWebpUrl && (
              <source srcSet={logoWebpUrl} type="image/webp" />
            )}
            <img
              src={logoUrl}
              alt="Palmtree Smokes"
              className="h-14 md:h-20 cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={onLogoClick}
            />
          </picture>
        </div>
        <div className="border-t border-gray-200/30 backdrop-blur-sm" style={toolbarStyle}>
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  className="w-full bg-white/80"
                />
              </div>
              {isMobile ? (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 mt-4">
                      <FilterControls />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <div className="hidden md:flex gap-4">
                  <FilterControls />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
