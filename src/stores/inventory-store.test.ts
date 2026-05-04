import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/lib/api';
import { useInventoryStore } from './inventory-store';

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiPatch = vi.mocked(api.patch);
const mockedApiDelete = vi.mocked(api.delete);

function resetStore() {
  useInventoryStore.setState({
    products: [],
    categories: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
}

describe('useInventoryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('fetchProducts mapea payload de API al dominio frontend', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 10,
            barcode: '7501000000010',
            name: 'Leche Entera',
            description: '1L',
            category_id: 3,
            category_name: 'Lácteos',
            price: 22.5,
            cost: 15,
            markup_pct: 50,
            quantity: 12,
            min_stock: 4,
            tax_mode: 'inherit',
            tax_rate: null,
            effective_tax_mode: 'taxed',
            effective_tax_rate: 0.16,
            stock_status: 'warning',
            expiration_date: '2026-12-31',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
          },
        ],
        pagination: { page: 2, limit: 20, total: 21, total_pages: 2 },
      },
    });

    await useInventoryStore.getState().fetchProducts(2);

    expect(mockedApiGet).toHaveBeenCalledWith('/api/inventory/products', {
      params: { page: 2, limit: 20 },
    });

    const state = useInventoryStore.getState();
    expect(state.currentPage).toBe(2);
    expect(state.totalPages).toBe(2);
    expect(state.totalProducts).toBe(21);
    expect(state.products).toEqual([
      expect.objectContaining({
        id: '10',
        categoryId: '3',
        markupPct: 50,
        minStock: 4,
        taxMode: 'inherit',
        taxRate: null,
        effectiveTaxMode: 'taxed',
        effectiveTaxRate: 0.16,
        stockStatus: 'warning',
        expirationDate: '2026-12-31',
      }),
    ]);
  });

  it('fetchCategories mapea defaultTaxMode y defaultTaxRate', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [
        {
          id: 4,
          name: 'Despensa',
          description: 'Secos',
          default_tax_mode: 'taxed',
          default_tax_rate: 0.16,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    await useInventoryStore.getState().fetchCategories();

    expect(useInventoryStore.getState().categories).toEqual([
      {
        id: '4',
        name: 'Despensa',
        description: 'Secos',
        defaultTaxMode: 'taxed',
        defaultTaxRate: 0.16,
      },
    ]);
  });

  it('addProduct traduce payload camelCase a snake_case y agrega producto mapeado', async () => {
    mockedApiPost.mockResolvedValueOnce({
      data: {
        id: 15,
        barcode: '7501000000015',
        name: 'Yogur',
        description: 'Natural',
        category_id: 8,
        category_name: 'Lácteos',
        price: 18,
        cost: 12,
        markup_pct: 50,
        quantity: 6,
        min_stock: 2,
        tax_mode: 'taxed',
        tax_rate: 0.16,
        effective_tax_mode: 'taxed',
        effective_tax_rate: 0.16,
        stock_status: 'good',
        expiration_date: '2026-08-20',
        created_at: '2026-02-01T00:00:00Z',
      },
    });

    const created = await useInventoryStore.getState().addProduct({
      barcode: '7501000000015',
      name: 'Yogur',
      description: 'Natural',
      categoryId: '8',
      price: 18,
      cost: 12,
      markupPct: 50,
      quantity: 6,
      minStock: 2,
      taxMode: 'taxed',
      taxRate: 0.16,
      expirationDate: '2026-08-20',
    });

    expect(mockedApiPost).toHaveBeenCalledWith('/api/inventory/products', {
      barcode: '7501000000015',
      name: 'Yogur',
      description: 'Natural',
      category_id: 8,
      price: 18,
      cost: 12,
      markup_pct: 50,
      quantity: 6,
      min_stock: 2,
      tax_mode: 'taxed',
      tax_rate: 0.16,
      expiration_date: '2026-08-20',
    });
    expect(created).toEqual(expect.objectContaining({
      id: '15',
      categoryId: '8',
      expirationDate: '2026-08-20',
      stockStatus: 'good',
    }));
    expect(useInventoryStore.getState().products).toHaveLength(1);
  });

  it('updateProduct traduce campos editables y reemplaza el producto en store', async () => {
    useInventoryStore.setState({
      products: [
        {
          id: '15',
          barcode: '7501000000015',
          name: 'Yogur',
          description: 'Natural',
          categoryId: '8',
          categoryName: 'Lácteos',
          price: 18,
          cost: 12,
          markupPct: 50,
          quantity: 6,
          minStock: 2,
          taxMode: 'taxed',
          taxRate: 0.16,
          effectiveTaxMode: 'taxed',
          effectiveTaxRate: 0.16,
          stockStatus: 'good',
          expirationDate: '2026-08-20',
          createdAt: '2026-02-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
        },
      ],
    });

    mockedApiPatch.mockResolvedValueOnce({
      data: {
        id: 15,
        barcode: '7501000000015',
        name: 'Yogur Griego',
        description: 'Sin azúcar',
        category_id: 9,
        category_name: 'Refrigerados',
        price: 20,
        cost: 13,
        markup_pct: 53.8,
        quantity: 9,
        min_stock: 3,
        tax_mode: 'inherit',
        tax_rate: null,
        effective_tax_mode: 'exempt',
        effective_tax_rate: 0,
        stock_status: 'warning',
        expiration_date: '2026-09-01',
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
      },
    });

    await useInventoryStore.getState().updateProduct('15', {
      name: 'Yogur Griego',
      categoryId: '9',
      markupPct: 53.8,
      minStock: 3,
      taxMode: 'inherit',
      taxRate: null,
      expirationDate: '2026-09-01',
    });

    expect(mockedApiPatch).toHaveBeenCalledWith('/api/inventory/products/15', {
      name: 'Yogur Griego',
      category_id: 9,
      markup_pct: 53.8,
      min_stock: 3,
      tax_mode: 'inherit',
      tax_rate: null,
      expiration_date: '2026-09-01',
    });
    expect(useInventoryStore.getState().products[0]).toEqual(
      expect.objectContaining({
        name: 'Yogur Griego',
        categoryId: '9',
        stockStatus: 'warning',
        expirationDate: '2026-09-01',
        effectiveTaxMode: 'exempt',
      })
    );
  });

  it('deleteProduct elimina el producto del store cuando API responde ok', async () => {
    useInventoryStore.setState({
      products: [
        {
          id: '15',
          barcode: '7501000000015',
          name: 'Yogur',
          categoryId: '8',
          categoryName: 'Lácteos',
          price: 18,
          cost: 12,
          quantity: 6,
          minStock: 2,
          taxMode: 'taxed',
          taxRate: 0.16,
          effectiveTaxMode: 'taxed',
          effectiveTaxRate: 0.16,
          createdAt: '2026-02-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
        },
      ],
    });

    mockedApiDelete.mockResolvedValueOnce({});

    await useInventoryStore.getState().deleteProduct('15');

    expect(mockedApiDelete).toHaveBeenCalledWith('/api/inventory/products/15');
    expect(useInventoryStore.getState().products).toEqual([]);
  });

  it('getStats devuelve fallback seguro cuando la API falla', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('network'));

    const stats = await useInventoryStore.getState().getStats();

    expect(stats).toEqual({
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      stockStatus: { good: 0, warning: 0, critical: 0 },
      categorySummary: [],
    });
  });
});
