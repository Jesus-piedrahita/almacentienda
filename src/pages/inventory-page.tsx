/**
 * @fileoverview Página principal de inventario.
 * Muestra estadísticas, estado del stock, y gestión de productos.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Package, Plus, TrendingUp, AlertTriangle, Tag } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { InventoryStatsCards } from '@/components/inventory/inventory-stats-cards';
import { StockStatusIndicator } from '@/components/inventory/stock-status-indicator';
import { CategoryChart } from '@/components/inventory/category-chart';
import { ProductsTable } from '@/components/inventory/products-table';
import { CategoryList } from '@/components/inventory/category-list';
import { AddProductDialog } from '@/components/inventory/add-product-dialog';
import { CategoryDialog } from '@/components/inventory/category-dialog';
import { EditProductDialog } from '@/components/inventory/edit-product-dialog';
import { ExpiringProductsCard } from '@/components/inventory/expiring-products-card';
import { LowStockProductsCard } from '@/components/inventory/low-stock-products-card';
import { BulkMarkupDialog } from '@/components/inventory/bulk-markup-dialog';
import { useProducts, useCategories, useInventoryStats, useDeleteProduct, useDeleteCategory, useExpiringProducts, useLowStockProducts } from '@/hooks/use-inventory';
import { confirmDelete, showError } from '@/hooks/use-confirm-dialog';
import type { Product, Category } from '@/types/inventory';

/**
 * InventoryPage - Página principal del módulo de inventario.
 *
 * Muestra:
 * - Estadísticas generales (total productos, por categoría, valor)
 * - Indicador visual del estado del stock
 * - Lista de categorías con acciones (editar/eliminar)
 * - Tabla de productos con acciones
 * - Botón para agregar nuevos productos
 *
 * @example
 * ```tsx
 * <InventoryPage />
 * ```
 */
export function InventoryPage() {
  // Estado local para dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkMarkupDialogOpen, setIsBulkMarkupDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Leer query param para sección activa (e.g. ?tab=low-stock desde dashboard)
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  // Queries con React Query
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(1);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useInventoryStats();
  const { data: expiringProducts = [] } = useExpiringProducts();
  const { data: lowStockProducts = [], isLoading: isLoadingLowStock } = useLowStockProducts();
  
  // Mutations
  const deleteProductMutation = useDeleteProduct();
  const deleteCategoryMutation = useDeleteCategory();

  // Productos del query
  const products = productsData?.data ?? [];
  // isLoading solo es true en la carga inicial (sin cache); isFetching cubriría background refetch
  const isLoadingStats_initial = isLoadingStats;
  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingStats_initial;

  // Handlers para editar y eliminar productos
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = await confirmDelete(product.name);

    if (confirmed) {
      try {
        await deleteProductMutation.mutateAsync(product.id);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        await showError('Error', 'No se pudo eliminar el producto. Intenta de nuevo.');
      }
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
    }
  };

  // Handlers para categorías
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = await confirmDelete(category.name);

    if (confirmed) {
      try {
        await deleteCategoryMutation.mutateAsync(category.id);
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        await showError('Error', 'No se pudo eliminar la categoría. Verifica que no tenga productos asociados.');
      }
    }
  };

  const handleCategoryDialogClose = (open: boolean) => {
    setIsCategoryDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

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
          <Button variant="outline" onClick={() => setIsBulkMarkupDialogOpen(true)}>
            Actualizar Markup en Lote
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <InventoryStatsCards stats={stats ?? null} isLoading={isLoading} />

      {/* Resumen simple de vencimientos (oculto si no hay productos con fecha) */}
      <ExpiringProductsCard products={expiringProducts} />

      {/* Sección detallada de stock bajo mínimo — visible siempre en inventario o por deep-link */}
      {(activeTab === 'low-stock' || !isLoadingLowStock) && (
        <section id="low-stock" aria-labelledby="low-stock-heading">
          <LowStockProductsCard />
        </section>
      )}

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
              isLoading={isLoadingStats_initial}
              isError={isStatsError}
              onRetry={refetchStats}
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
            <CategoryChart
              categories={stats?.categorySummary ?? []}
              isLoading={isLoadingStats_initial}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de categorías */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            Categorías
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddCategory} className="gap-2">
            <Plus className="size-4" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories ?? []}
            isLoading={isLoadingCategories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </CardContent>
      </Card>

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
          <ProductsTable 
            products={products} 
            isLoading={isLoadingProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      <BulkMarkupDialog
        open={isBulkMarkupDialogOpen}
        onOpenChange={setIsBulkMarkupDialogOpen}
        categories={categories ?? []}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds(new Set())}
      />

      {/* Dialog para agregar producto */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories ?? []}
      />

      {/* Dialog para agregar/editar categoría */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={handleCategoryDialogClose}
        category={selectedCategory}
      />

      {/* Dialog para editar producto */}
      {selectedProduct && (
        <EditProductDialog
          key={selectedProduct.id}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          categories={categories ?? []}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
