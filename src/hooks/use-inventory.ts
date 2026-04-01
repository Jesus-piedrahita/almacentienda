/**
 * @fileoverview React Query hooks para el módulo de inventario.
 * Proporciona fetching, caching y mutaciones para productos, categorías y estadísticas.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, Category, InventoryStats, CreateProductInput, CreateCategoryInput } from '@/types/inventory';

// ============================================================
// Types de la API
// ============================================================

interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

interface ApiProduct {
  id: number;
  barcode: string;
  name: string;
  description?: string;
  category_id: number;
  category_name: string;
  price: number;
  cost: number;
  quantity: number;
  min_stock: number;
  created_at: string;
  updated_at?: string;
  stock_status: 'good' | 'warning' | 'critical';
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface ApiProductsResponse {
  data: ApiProduct[];
  pagination: ApiPagination;
}

interface ApiStats {
  total_products: number;
  total_quantity: number;
  total_value: number;
  stock_status: {
    good: number;
    warning: number;
    critical: number;
  };
  category_summary: Array<{
    category_id: number;
    category_name: string;
    product_count: number;
    total_quantity: number;
    total_value: number;
  }>;
}

// ============================================================
// Mappers
// ============================================================

function mapApiCategoryToCategory(apiCategory: ApiCategory): Category {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    description: apiCategory.description,
  };
}

function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  return {
    id: String(apiProduct.id),
    barcode: apiProduct.barcode,
    name: apiProduct.name,
    description: apiProduct.description,
    categoryId: String(apiProduct.category_id),
    categoryName: apiProduct.category_name,
    price: Number(apiProduct.price),
    cost: Number(apiProduct.cost),
    quantity: apiProduct.quantity,
    minStock: apiProduct.min_stock,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at || apiProduct.created_at,
  };
}

function mapApiStatsToInventoryStats(apiStats: ApiStats): InventoryStats {
  return {
    totalProducts: apiStats.total_products,
    totalQuantity: apiStats.total_quantity,
    totalValue: apiStats.total_value,
    stockStatus: {
      good: apiStats.stock_status.good,
      warning: apiStats.stock_status.warning,
      critical: apiStats.stock_status.critical,
    },
    categorySummary: apiStats.category_summary.map((cat) => ({
      categoryId: String(cat.category_id),
      categoryName: cat.category_name,
      productCount: cat.product_count,
      totalQuantity: cat.total_quantity,
      totalValue: cat.total_value,
    })),
  };
}

// ============================================================
// Query Keys
// ============================================================

export const queryKeys = {
  products: (page: number) => ['products', page] as const,
  categories: ['categories'] as const,
  stats: ['inventory-stats'] as const,
};

// ============================================================
// Hooks de Query
// ============================================================

/**
 * Hook para obtener productos paginados
 */
export function useProducts(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.products(page),
    queryFn: async (): Promise<{ data: Product[]; pagination: ApiPagination }> => {
      const response = await api.get<ApiProductsResponse>('/api/inventory/products', {
        params: { page, limit: 20 },
      });
      
      return {
        data: response.data.data.map(mapApiProductToProduct),
        pagination: response.data.pagination,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener todas las categorías
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get<ApiCategory[]>('/api/inventory/categories');
      return response.data.map(mapApiCategoryToCategory);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas del inventario
 */
export function useInventoryStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async (): Promise<InventoryStats> => {
      const response = await api.get<ApiStats>('/api/inventory/stats');
      return mapApiStatsToInventoryStats(response.data);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// ============================================================
// Hooks de Mutation
// ============================================================

/**
 * Hook para agregar un nuevo producto
 */
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput): Promise<Product> => {
      const productData = {
        ...input,
        category_id: Number(input.categoryId),
      };
      const response = await api.post<ApiProduct>('/api/inventory/products', productData);
      return mapApiProductToProduct(response.data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para actualizar un producto existente
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }): Promise<Product> => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.categoryId) {
        updateData.category_id = Number(updates.categoryId);
        delete updateData.categoryId;
      }

      const response = await api.patch<ApiProduct>(
        `/api/inventory/products/${id}`,
        updateData
      );
      return mapApiProductToProduct(response.data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/inventory/products/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/**
 * Hook para agregar una nueva categoría
 */
export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<Category> => {
      const response = await api.post<ApiCategory>('/api/inventory/categories', input);
      return mapApiCategoryToCategory(response.data);
    },
    onSuccess: () => {
      // Invalidar query de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

/**
 * Hook para actualizar una categoría existente
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCategoryInput> }): Promise<Category> => {
      const response = await api.patch<ApiCategory>(
        `/api/inventory/categories/${id}`,
        updates
      );
      return mapApiCategoryToCategory(response.data);
    },
    onSuccess: () => {
      // Invalidar queries de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

/**
 * Hook para eliminar una categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/inventory/categories/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
