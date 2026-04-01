/**
 * @fileoverview Store de inventario con integración a API real.
 * Proporciona estado global para productos, categorías y estadísticas.
 * Conecta con el backend FastAPI en /api/inventory/*
 */

import { create } from 'zustand';
import api from '@/lib/api';
import type {
  Product,
  Category,
  InventoryStats,
  CreateProductInput,
  CreateCategoryInput,
} from '@/types/inventory';

// Tipos para la respuesta de la API
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

// Funciones helper para convertir tipos de la API a tipos del frontend
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

/**
 * Estado del store de inventario
 */
interface InventoryState {
  // Data
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;

  // Actions
  fetchProducts: (page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchStats: () => Promise<InventoryStats>;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  addCategory: (category: CreateCategoryInput) => Promise<Category>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductsByCategory: (categoryId: string) => Product[];
  getStats: () => Promise<InventoryStats>;
}

/**
 * Store de inventario conectado a la API real.
 *
 * @example
 * ```tsx
 * const { products, fetchProducts } = useInventoryStore();
 *
 * // En componente
 * useEffect(() => { fetchProducts(); }, []);
 * ```
 */
export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,

  fetchProducts: async (page: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiProductsResponse>('/api/inventory/products', {
        params: { page, limit: 20 },
      });

      const products = response.data.data.map(mapApiProductToProduct);

      set({
        products,
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.total_pages,
        totalProducts: response.data.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      set({ error: 'Error al cargar productos', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get<ApiCategory[]>('/api/inventory/categories');
      const categories = response.data.map(mapApiCategoryToCategory);
      set({ categories });
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      set({ error: 'Error al cargar categorías' });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get<ApiStats>('/api/inventory/stats');
      return mapApiStatsToInventoryStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      throw error;
    }
  },

  addProduct: async (input: CreateProductInput) => {
    set({ isLoading: true, error: null });
    try {
      // Convertir categoryId de string a número
      const productData = {
        ...input,
        category_id: Number(input.categoryId),
      };

      const response = await api.post<ApiProduct>('/api/inventory/products', productData);
      const newProduct = mapApiProductToProduct(response.data);

      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));

      return newProduct;
    } catch (error) {
      set({ error: 'Error al agregar producto', isLoading: false });
      throw error;
    }
  },

  addCategory: async (input: CreateCategoryInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiCategory>('/api/inventory/categories', input);
      const newCategory = mapApiCategoryToCategory(response.data);

      set((state) => ({
        categories: [...state.categories, newCategory],
        isLoading: false,
      }));

      return newCategory;
    } catch (error) {
      set({ error: 'Error al agregar categoría', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      // Convertir categoryId de string a número si existe
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.categoryId) {
        updateData.category_id = Number(updates.categoryId);
        delete updateData.categoryId;
      }

      const response = await api.patch<ApiProduct>(
        `/api/inventory/products/${id}`,
        updateData
      );
      const updatedProduct = mapApiProductToProduct(response.data);

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? updatedProduct : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Error al actualizar producto', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/inventory/products/${id}`);

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Error al eliminar producto', isLoading: false });
      throw error;
    }
  },

  getProductsByCategory: (categoryId: string) => {
    return get().products.filter((p) => p.categoryId === categoryId);
  },

  getStats: async () => {
    try {
      const response = await api.get<ApiStats>('/api/inventory/stats');
      return mapApiStatsToInventoryStats(response.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Return default stats if API fails
      return {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        stockStatus: { good: 0, warning: 0, critical: 0 },
        categorySummary: [],
      };
    }
  },
}));