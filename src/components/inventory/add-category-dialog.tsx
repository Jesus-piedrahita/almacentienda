/**
 * @fileoverview Dialog para agregar nuevas categorías.
 * Formulario simple para crear categorías de productos.
 */

import { useState } from 'react';
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
import type { CreateCategoryInput } from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventory-store';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddCategoryDialog - Dialog para agregar nuevas categorías.
 *
 * Incluye:
 * - Campos: nombre, descripción
 * - Validación de campos requeridos
 * - Estados de carga y error
 *
 * @example
 * ```tsx
 * <AddCategoryDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const { addCategory, isLoading } = useInventoryStore();

  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCategoryInput, string>>>({});

  const handleChange = (field: keyof CreateCategoryInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCategoryInput, string>> = {};

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
      await addCategory(formData);
      // Resetear formulario y cerrar
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            Agregar Categoría
          </DialogTitle>
          <DialogDescription>
            Crea una nueva categoría para organizar tus productos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de la categoría */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de Categoría *</Label>
            <Input
              id="name"
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
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
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
                'Agregar Categoría'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
