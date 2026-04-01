/**
 * @fileoverview Dialog para agregar o editar categorías.
 * Formulario simple para crear o modificar categorías de productos.
 */

import { useState, useEffect } from 'react';
import { Tag, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category, CreateCategoryInput } from '@/types/inventory';
import { useAddCategory, useUpdateCategory } from '@/hooks/use-inventory';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

type CategoryFormData = CreateCategoryInput;

/**
 * CategoryDialog - Dialog para agregar o editar categorías.
 *
 * Incluye:
 * - Modo agregar: campos vacíos
 * - Modo editar: campos precargados con datos de la categoría
 * - Validación de campos requeridos
 * - Estados de carga y error
 *
 * @example
 * ```tsx
 * // Para agregar
 * <CategoryDialog open={isOpen} onOpenChange={setIsOpen} />
 * 
 * // Para editar
 * <CategoryDialog open={isOpen} onOpenChange={setIsOpen} category={selectedCategory} />
 * ```
 */
export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isEditMode = !!category;
  const isLoading = addCategoryMutation.isPending || updateCategoryMutation.isPending;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  // Cargar datos cuando se abre en modo edición
  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else if (!open) {
      // Resetear al cerrar
      resetForm();
    }
  }, [category, open]);

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          updates: formData,
        });
      } else {
        await addCategoryMutation.mutateAsync(formData);
      }
      // Resetear formulario y cerrar
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(isEditMode ? 'Error al actualizar categoría:' : 'Error al agregar categoría:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const dialogTitle = isEditMode ? 'Editar Categoría' : 'Agregar Categoría';
  const dialogDescription = isEditMode
    ? 'Modifica los datos de la categoría.'
    : 'Crea una nueva categoría para organizar tus productos.';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Agregar Categoría';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de la categoría */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre de Categoría *</Label>
            <Input
              id="category-name"
              placeholder="Ej: Electrónica, Ropa, Alimentos..."
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="category-description">Descripción</Label>
            <Input
              id="category-description"
              placeholder="Descripción breve de la categoría"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
