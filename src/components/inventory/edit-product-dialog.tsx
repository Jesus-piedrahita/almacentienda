/**
 * @fileoverview Dialog para editar productos existentes del inventario.
 * Formulario con datos precargados para modificar productos.
 */

import { useState } from 'react';
import { Package, Loader2 } from 'lucide-react';

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
import { useCurrency } from '@/hooks/use-currency';
import type { Category, Product, UpdateProductInput } from '@/types/inventory';
import { useUpdateProduct } from '@/hooks/use-inventory';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  product: Product | null;
}

/**
 * EditProductDialog - Dialog para editar productos existentes.
 *
 * Incluye:
 * - Campos precargados con datos del producto
 * - Validación de campos requeridos
 * - Estados de carga y error
 *
 * @example
 * ```tsx
 * <EditProductDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   categories={categories}
 *   product={selectedProduct}
 * />
 * ```
 */
export function EditProductDialog({
  open,
  onOpenChange,
  categories,
  product,
}: EditProductDialogProps) {
  const updateProductMutation = useUpdateProduct();
  const { profile } = useCurrency();

  // Derivar el estado inicial a partir del producto seleccionado.
  // Se usa `product` como fuente de verdad para inicializar el formulario;
  // el componente se remonta (vía `key={product?.id}`) cada vez que cambia el producto,
  // evitando la necesidad de un efecto secundario para re-sincronizar el estado.
  const [formData, setFormData] = useState<UpdateProductInput>(() =>
    product
      ? {
          barcode: product.barcode,
          name: product.name,
          description: product.description || '',
          categoryId: product.categoryId,
          price: product.price,
          cost: product.cost,
          quantity: product.quantity,
          minStock: product.minStock,
          expiration_date: product.expiration_date,
        }
      : {
          barcode: '',
          name: '',
          description: '',
          categoryId: '',
          price: 0,
          cost: 0,
          quantity: 0,
          minStock: 5,
        }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProductInput, string>>>({});

  const isLoading = updateProductMutation.isPending;

  const handleChange = (field: keyof UpdateProductInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProductInput, string>> = {};

    if (!formData.barcode?.trim()) {
      newErrors.barcode = 'El código de barras es requerido';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoría es requerida';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    if (formData.cost && formData.cost < 0) {
      newErrors.cost = 'El costo no puede ser negativo';
    }
    if (formData.quantity && formData.quantity < 0) {
      newErrors.quantity = 'La cantidad no puede ser negativa';
    }
    if (formData.minStock && formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !validateForm()) {
      return;
    }

    try {
      // Normalise optional fields: convert empty strings to undefined
      const updates: typeof formData = {
        ...formData,
        expiration_date: formData.expiration_date?.trim() || undefined,
      };
      await updateProductMutation.mutateAsync({ id: product.id, updates });
      // Cerrar dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  // Si no hay producto, no renderizar nada
  if (!product) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del producto en el inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Código de Barras y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-barcode">Código de Barras *</Label>
              <Input
                id="edit-barcode"
                placeholder="Ej: 7501234567890"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                disabled={isLoading}
              />
              {errors.barcode && (
                <p className="text-xs text-destructive">{errors.barcode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Input
              id="edit-description"
              placeholder="Descripción breve del producto"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Fila 3: Categoría */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoría *</Label>
            <select
              id="edit-category"
              className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>

          {/* Fila 4: Precio y Costo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio ({profile?.baseCurrency ?? 'base'}) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cost">Costo ({profile?.baseCurrency ?? 'base'})</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
              {errors.cost && (
                <p className="text-xs text-destructive">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Fila 5: Cantidad y Stock Mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Cantidad *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Stock Mínimo</Label>
              <Input
                id="edit-minStock"
                type="number"
                min="0"
                placeholder="5"
                value={formData.minStock || ''}
                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                disabled={isLoading}
              />
              {errors.minStock && (
                <p className="text-xs text-destructive">{errors.minStock}</p>
              )}
            </div>
          </div>

          {/* Fila 6: Fecha de Vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="edit-expiration_date">Fecha de Vencimiento</Label>
            <Input
              id="edit-expiration_date"
              type="date"
              value={formData.expiration_date ?? ''}
              onChange={(e) =>
                handleChange('expiration_date', e.target.value || '')
              }
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Dejar vacío si el producto no tiene fecha de vencimiento.
            </p>
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
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
