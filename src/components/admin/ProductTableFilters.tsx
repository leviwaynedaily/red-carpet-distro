import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
}

export function ProductTableFilters({
  searchQuery,
  onSearchChange,
  columns,
  visibleColumns,
  onColumnToggle,
}: ProductTableFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Input
        type="search"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-[300px]"
      />
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
    </div>
  );
}