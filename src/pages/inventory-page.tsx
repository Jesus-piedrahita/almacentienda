/**
 * @fileoverview Página principal de inventario.
 * Muestra estadísticas, estado del stock, y gestión de productos.
 */

import { useEffect, useState } from 'react';
import { Package, Plus, TrendingUp, AlertTriangle, Tag } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/stores/inventory-store';

import { InventoryStatsCards } from '@/components/inventory/inventory-stats-cards';
import { StockStatusIndicator } from '@/components/inventory/stock-status-indicator';
import { CategoryChart } from '@/components/inventory/category-chart';
import { ProductsTable } from '@/components/inventory/products-table';
import { AddProductDialog } from '@/components/inventory/add-product-dialog';
import { AddCategoryDialog } from '@/components/inventory/add-category-dialog';

/**
 * InventoryPage - Página principal del módulo de inventario.
 *
 * Muestra:
 * - Estadísticas generales (total productos, por categoría, valor)
 * - Indicador visual del estado del stock
 * - Tabla de productos con acciones
 * - Botón para agregar nuevos productos
 *
 * @example
 * ```tsx
 * <InventoryPage />
 * ```
 */
export function InventoryPage() {
  const { products, categories, fetchProducts, fetchCategories, isLoading } = useInventoryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Calcular estadísticas derivadas de los productos
  const stats = products.length > 0 ? useInventoryStore.getState().getStats() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona tus productos y controla el stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(true)} className="gap-2">
            <Tag className="size-4" />
            Agregar Categoría
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <InventoryStatsCards stats={stats} isLoading={isLoading} />

      {/* Estado del stock y gráfico por categoría */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Indicador visual de stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-500" />
              Estado del Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockStatusIndicator
              good={stats?.stockStatus.good ?? 0}
              warning={stats?.stockStatus.warning ?? 0}
              critical={stats?.stockStatus.critical ?? 0}
            />
          </CardContent>
        </Card>

        {/* Distribución por categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Productos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart categories={stats?.categorySummary ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Lista de Productos
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {products.length} producto{products.length !== 1 ? 's' : ''} en inventario
          </span>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Dialog para agregar producto */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
      />

      {/* Dialog para agregar categoría */}
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
      />
    </div>
  );
}