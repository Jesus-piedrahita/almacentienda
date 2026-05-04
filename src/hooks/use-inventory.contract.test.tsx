/**
 * @fileoverview Contract tests para hooks públicos de inventory.
 *
 * Valida que el borde frontend↔backend mantenga el shape esperado al mapear:
 * - products paginados
 * - categories
 * - inventory stats
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from '@/lib/api';
import { useCategories, useInventoryStats, useProducts } from './use-inventory';

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('inventory contract hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useProducts mantiene contrato de mapping y paginación', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 11,
            barcode: '7501000000011',
            name: 'Queso Crema',
            description: 'Pote 190g',
            category_id: 6,
            category_name: 'Refrigerados',
            price: 34.5,
            cost: 24,
            markup_pct: 43.75,
            quantity: 8,
            min_stock: 3,
            tax_mode: 'taxed',
            tax_rate: 0.16,
            effective_tax_mode: 'taxed',
            effective_tax_rate: 0.16,
            stock_status: 'warning',
            expiration_date: '2026-10-15',
            created_at: '2026-03-01T00:00:00Z',
            updated_at: '2026-03-02T00:00:00Z',
          },
        ],
        pagination: {
          page: 3,
          limit: 20,
          total: 45,
          total_pages: 3,
        },
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProducts(3), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiGet).toHaveBeenCalledWith('/api/inventory/products', {
      params: { page: 3, limit: 20 },
    });
    expect(result.current.data).toEqual({
      data: [
        {
          id: '11',
          barcode: '7501000000011',
          name: 'Queso Crema',
          description: 'Pote 190g',
          categoryId: '6',
          categoryName: 'Refrigerados',
          price: 34.5,
          cost: 24,
          markupPct: 43.75,
          quantity: 8,
          minStock: 3,
          stockStatus: 'warning',
          taxMode: 'taxed',
          taxRate: 0.16,
          effectiveTaxMode: 'taxed',
          effectiveTaxRate: 0.16,
          expirationDate: '2026-10-15',
          createdAt: '2026-03-01T00:00:00Z',
          updatedAt: '2026-03-02T00:00:00Z',
        },
      ],
      pagination: {
        page: 3,
        limit: 20,
        total: 45,
        total_pages: 3,
      },
    });
  });

  it('useCategories mantiene contrato de impuestos por categoría', async () => {
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
        {
          id: 5,
          name: 'Verduras',
          description: undefined,
          default_tax_mode: 'exempt',
          default_tax_rate: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: '4',
        name: 'Despensa',
        description: 'Secos',
        defaultTaxMode: 'taxed',
        defaultTaxRate: 0.16,
      },
      {
        id: '5',
        name: 'Verduras',
        description: undefined,
        defaultTaxMode: 'exempt',
        defaultTaxRate: null,
      },
    ]);
  });

  it('useInventoryStats mantiene contrato de summary y stockStatus', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: {
        total_products: 12,
        total_quantity: 87,
        total_value: 4200.5,
        stock_status: {
          good: 7,
          warning: 3,
          critical: 2,
        },
        category_summary: [
          {
            category_id: 4,
            category_name: 'Despensa',
            product_count: 5,
            total_quantity: 33,
            total_value: 1800,
          },
        ],
      },
    });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      totalProducts: 12,
      totalQuantity: 87,
      totalValue: 4200.5,
      stockStatus: {
        good: 7,
        warning: 3,
        critical: 2,
      },
      categorySummary: [
        {
          categoryId: '4',
          categoryName: 'Despensa',
          productCount: 5,
          totalQuantity: 33,
          totalValue: 1800,
        },
      ],
    });
  });
});
