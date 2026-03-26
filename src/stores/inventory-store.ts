/**
 * @fileoverview Store de inventario con datos mock dinámicos.
 * Proporciona estado global para productos, categorías y estadísticas.
 * Diseñado para facilitar la migración a API real.
 */

import { create } from 'zustand';
import type {
  Product,
  Category,
  InventoryStats,
  CategorySummary,
  CreateProductInput,
  CreateCategoryInput,
} from '@/types/inventory';
import { getStockStatus } from '@/types/inventory';

/**
 * Datos mock iniciales - Categorías
 */
const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Electrónica', description: 'Dispositivos electrónicos y accesorios' },
  { id: 'cat-2', name: 'Ropa', description: 'Ropa y accesorios de vestir' },
  { id: 'cat-3', name: 'Alimentos', description: 'Productos alimenticios y bebidas' },
  { id: 'cat-4', name: 'Hogar', description: 'Artículos para el hogar' },
  { id: 'cat-5', name: 'Deportes', description: 'Equipos y accesorios deportivos' },
];

/**
 * Datos mock iniciales - Productos
 */
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    barcode: '7501234567890',
    name: 'Laptop HP Pavilion',
    description: 'Laptop 15.6" Intel Core i5 8GB RAM',
    categoryId: 'cat-1',
    categoryName: 'Electrónica',
    price: 899.99,
    cost: 650.00,
    quantity: 12,
    minStock: 5,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'prod-2',
    barcode: '7501234567891',
    name: 'Mouse Inalámbrico',
    description: 'Mouse óptico wireless USB',
    categoryId: 'cat-1',
    categoryName: 'Electrónica',
    price: 25.99,
    cost: 12.00,
    quantity: 45,
    minStock: 10,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'prod-3',
    barcode: '7501234567892',
    name: 'Camisa Manga Larga',
    description: 'Camisa de algodón para hombre',
    categoryId: 'cat-2',
    categoryName: 'Ropa',
    price: 49.99,
    cost: 20.00,
    quantity: 30,
    minStock: 8,
    createdAt: '2024-02-01T12:00:00Z',
    updatedAt: '2024-02-01T12:00:00Z',
  },
  {
    id: 'prod-4',
    barcode: '7501234567893',
    name: 'Pantalón Jeans',
    description: 'Pantalón denim hombre',
    categoryId: 'cat-2',
    categoryName: 'Ropa',
    price: 59.99,
    cost: 25.00,
    quantity: 3,
    minStock: 5,
    createdAt: '2024-02-05T14:30:00Z',
    updatedAt: '2024-02-05T14:30:00Z',
  },
  {
    id: 'prod-5',
    barcode: '7501234567894',
    name: 'Arroz Premium 1kg',
    description: 'Arroz blanco de alta calidad',
    categoryId: 'cat-3',
    categoryName: 'Alimentos',
    price: 4.99,
    cost: 2.50,
    quantity: 100,
    minStock: 20,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'prod-6',
    barcode: '7501234567895',
    name: 'Aceite Oliva 500ml',
    description: 'Aceite de oliva extra virgen',
    categoryId: 'cat-3',
    categoryName: 'Alimentos',
    price: 12.99,
    cost: 7.00,
    quantity: 2,
    minStock: 6,
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
  },
  {
    id: 'prod-7',
    barcode: '7501234567896',
    name: 'Juego Sábanas',
    description: 'Juego de sábanas 4 piezas',
    categoryId: 'cat-4',
    categoryName: 'Hogar',
    price: 79.99,
    cost: 40.00,
    quantity: 15,
    minStock: 5,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'prod-8',
    barcode: '7501234567897',
    name: 'Balanza Digital',
    description: 'Balanza para cocina digital',
    categoryId: 'cat-4',
    categoryName: 'Hogar',
    price: 19.99,
    cost: 8.00,
    quantity: 8,
    minStock: 4,
    createdAt: '2024-02-12T13:00:00Z',
    updatedAt: '2024-02-12T13:00:00Z',
  },
  {
    id: 'prod-9',
    barcode: '7501234567898',
    name: 'Balón Fútbol',
    description: 'Balón de fútbol profesional',
    categoryId: 'cat-5',
    categoryName: 'Deportes',
    price: 34.99,
    cost: 15.00,
    quantity: 20,
    minStock: 5,
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z',
  },
  {
    id: 'prod-10',
    barcode: '7501234567899',
    name: 'Raqueta Tenis',
    description: 'Raqueta de tenis profesional',
    categoryId: 'cat-5',
    categoryName: 'Deportes',
    price: 89.99,
    cost: 45.00,
    quantity: 5,
    minStock: 3,
    createdAt: '2024-02-18T15:00:00Z',
    updatedAt: '2024-02-18T15:00:00Z',
  },
  {
    id: 'prod-11',
    barcode: '7501234567900',
    name: 'Auriculares Bluetooth',
    description: 'Auriculares wireless con micrófono',
    categoryId: 'cat-1',
    categoryName: 'Electrónica',
    price: 59.99,
    cost: 30.00,
    quantity: 6,
    minStock: 8,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'prod-12',
    barcode: '7501234567901',
    name: 'Zapatillas Running',
    description: 'Zapatillas para correr profesionales',
    categoryId: 'cat-5',
    categoryName: 'Deportes',
    price: 119.99,
    cost: 60.00,
    quantity: 4,
    minStock: 4,
    createdAt: '2024-02-22T11:30:00Z',
    updatedAt: '2024-02-22T11:30:00Z',
  },
];

/**
 * Estado del store de inventario
 */
interface InventoryState {
  // Data
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchStats: () => Promise<InventoryStats>;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  addCategory: (category: CreateCategoryInput) => Promise<Category>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductsByCategory: (categoryId: string) => Product[];
  getStats: () => InventoryStats;
}

/**
 * Genera un ID único simple
 */
function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcula las estadísticas del inventario
 */
function calculateStats(products: Product[]): InventoryStats {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Summary por categoría
  const categoryMap = new Map<string, CategorySummary>();

  products.forEach((product) => {
    const existing = categoryMap.get(product.categoryId);
    if (existing) {
      existing.productCount += 1;
      existing.totalValue += product.price * product.quantity;
      existing.totalQuantity += product.quantity;
    } else {
      categoryMap.set(product.categoryId, {
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        productCount: 1,
        totalValue: product.price * product.quantity,
        totalQuantity: product.quantity,
      });
    }
  });

  // Stock status
  let good = 0;
  let warning = 0;
  let critical = 0;

  products.forEach((product) => {
    const status = getStockStatus(product.quantity);
    if (status === 'good') good++;
    else if (status === 'warning') warning++;
    else critical++;
  });

  return {
    totalProducts,
    totalQuantity,
    totalValue,
    categorySummary: Array.from(categoryMap.values()),
    stockStatus: { good, warning, critical },
  };
}

/**
 * Store de inventario con datos mock.
 * Para migrar a API real, reemplazar las funciones con llamadas HTTP.
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

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));
      // TODO: Reemplazar con llamada real a API
      // const response = await api.get('/products');
      // set({ products: response.data });
      set({ products: mockProducts, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar productos', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 200));
      // TODO: Reemplazar con llamada real a API
      // const response = await api.get('/categories');
      set({ categories: mockCategories });
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  },

  fetchStats: async () => {
    const { products } = get();
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 100));
    return calculateStats(products);
  },

  addProduct: async (input) => {
    set({ isLoading: true, error: null });
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      const category = get().categories.find((c) => c.id === input.categoryId);
      const now = new Date().toISOString();

      const newProduct: Product = {
        id: generateId(),
        ...input,
        categoryName: category?.name || 'Sin categoría',
        createdAt: now,
        updatedAt: now,
      };

      // TODO: Reemplazar con llamada real a API
      // const response = await api.post('/products', input);
      // set({ products: [...get().products, response.data] });

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

  addCategory: async (input) => {
    set({ isLoading: true, error: null });
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newCategory: Category = {
        id: generateId(),
        ...input,
      };

      // TODO: Reemplazar con llamada real a API
      // const response = await api.post('/categories', input);
      // set({ categories: [...get().categories, response.data] });

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

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      // TODO: Reemplazar con llamada real a API
      // await api.patch(`/products/${id}`, updates);

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Error al actualizar producto', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      // TODO: Reemplazar con llamada real a API
      // await api.delete(`/products/${id}`);

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Error al eliminar producto', isLoading: false });
      throw error;
    }
  },

  getProductsByCategory: (categoryId) => {
    return get().products.filter((p) => p.categoryId === categoryId);
  },

  getStats: () => {
    return calculateStats(get().products);
  },
}));