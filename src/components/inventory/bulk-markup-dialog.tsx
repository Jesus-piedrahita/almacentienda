import { useState } from 'react';

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
import { useBulkMarkup } from '@/hooks/use-inventory';
import type { BulkMarkupScope, Category } from '@/types/inventory';

interface BulkMarkupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedIds: Set<string>;
  onSuccess?: () => void;
}

export function BulkMarkupDialog({
  open,
  onOpenChange,
  categories,
  selectedIds,
  onSuccess,
}: BulkMarkupDialogProps) {
  const bulkMarkupMutation = useBulkMarkup();
  const [scope, setScope] = useState<BulkMarkupScope>('selected');
  const [markupPct, setMarkupPct] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);

  const isLoading = bulkMarkupMutation.isPending;
  const selectedCount = selectedIds.size;

  const canSubmit = (() => {
    if (isLoading || markupPct === '') return false;
    if (scope === 'selected') return selectedCount > 0;
    if (scope === 'category') return categoryId !== '';
    return confirmAll;
  })();

  const resetState = () => {
    setScope('selected');
    setMarkupPct('');
    setCategoryId('');
    setConfirmAll(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || markupPct === '') return;

    if (scope === 'selected') {
      await bulkMarkupMutation.mutateAsync({
        scope: 'selected',
        productIds: Array.from(selectedIds),
        markupPct,
      });
    }

    if (scope === 'category') {
      await bulkMarkupMutation.mutateAsync({
        scope: 'category',
        categoryId: Number(categoryId),
        markupPct,
      });
    }

    if (scope === 'all') {
      await bulkMarkupMutation.mutateAsync({
        scope: 'all',
        markupPct,
      });
    }

    onSuccess?.();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Actualizar markup en lote</DialogTitle>
          <DialogDescription>
            Aplicá un porcentaje de ganancia a productos seleccionados, una categoría o todo el catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-3">
            <Label>Alcance</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="bulk-scope"
                  value="selected"
                  checked={scope === 'selected'}
                  onChange={() => setScope('selected')}
                />
                Seleccionados ({selectedCount})
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="bulk-scope"
                  value="category"
                  checked={scope === 'category'}
                  onChange={() => setScope('category')}
                />
                Categoría
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="bulk-scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                />
                Todos los productos
              </label>
            </div>
          </fieldset>

          {scope === 'category' && (
            <div className="space-y-2">
              <Label htmlFor="bulk-category">Categoría</Label>
              <select
                id="bulk-category"
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bulk-markup">Markup (%)</Label>
            <Input
              id="bulk-markup"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={markupPct}
              onChange={(e) => setMarkupPct(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={isLoading}
            />
          </div>

          {scope === 'all' && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">
                Esta acción actualizará TODO el catálogo.
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmAll}
                  onChange={(e) => setConfirmAll(e.target.checked)}
                />
                Confirmo que quiero actualizar todos los productos.
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Aplicar markup
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
