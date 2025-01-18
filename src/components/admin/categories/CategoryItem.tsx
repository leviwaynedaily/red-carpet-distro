import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
  };
  onEdit: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(category.name);

  const handleSave = async () => {
    await onEdit(category.id, editingName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingName(category.name);
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span>{category.name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}