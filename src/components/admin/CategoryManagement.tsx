import { CategoryForm } from "./categories/CategoryForm";
import { CategoryList } from "./categories/CategoryList";
import { useQueryClient } from "@tanstack/react-query";

export function CategoryManagement() {
  const queryClient = useQueryClient();

  const handleCategoryAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div className="space-y-4">
      <CategoryForm onCategoryAdded={handleCategoryAdded} />
      <CategoryList />
    </div>
  );
}