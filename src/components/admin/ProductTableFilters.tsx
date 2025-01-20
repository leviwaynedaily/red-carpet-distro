import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileDown } from "lucide-react";

interface Column {
  label: string;
  key: string;
}

interface ProductTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  columns: Column[];
  visibleColumns: string[];
  onColumnToggle: (column: string) => void;
  onImport?: () => void;
  onExport?: () => void;
  onDownloadTemplate?: () => void;
  showColumnToggle?: boolean;
}

export function ProductTableFilters({
  searchQuery,
  onSearchChange,
  columns,
  visibleColumns,
  onColumnToggle,
  onImport,
  onExport,
  onDownloadTemplate,
  showColumnToggle = true,
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
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => onColumnToggle(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onDownloadTemplate && (
          <Button variant="outline" onClick={onDownloadTemplate}>
            <FileDown className="h-4 w-4 mr-2" />
            Template
          </Button>
        )}
        {onImport && (
          <Button variant="outline" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        {onExport && (
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}