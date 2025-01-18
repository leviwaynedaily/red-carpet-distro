import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileUp } from "lucide-react";

interface ProductTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onImport: () => void;
  onExport: () => void;
  onDownloadTemplate: () => void;
}

export function ProductTableFilters({
  searchQuery,
  onSearchChange,
  onImport,
  onExport,
  onDownloadTemplate,
}: ProductTableFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[300px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onDownloadTemplate}>
          <FileDown className="h-4 w-4 mr-2" />
          Template
        </Button>
        <Button variant="outline" onClick={onImport}>
          <FileUp className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}