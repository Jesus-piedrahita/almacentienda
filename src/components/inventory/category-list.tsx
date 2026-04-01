/**
 * @fileoverview Componente de lista de categorías.
 * Muestra las categorías existentes con opciones de editar y eliminar.
 */

import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types/inventory';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/**
 * CategoryList - Lista de categorías con acciones.
 *
 * Muestra:
 * - Nombre de la categoría
 * - Descripción (si existe)
 * - Botones de editar y eliminar
 *
 * @example
 * ```tsx
 * <CategoryList
 *   categories={categories}
 *   isLoading={isLoading}
 *   onEdit={handleEditCategory}
 *   onDelete={handleDeleteCategory}
 * />
 * ```
 */
export function CategoryList({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center text-muted-foreground">
        No hay categorías. Crea tu primera categoría.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex-1">
            <h3 className="font-medium">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground">{category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit(category)}
            >
              <Edit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
