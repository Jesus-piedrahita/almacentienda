import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductsPerformanceSection } from './products-performance-section';

vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number) => `money:${value}`,
  }),
}));

describe('ProductsPerformanceSection', () => {
  it('renders best seller and categories', () => {
    render(
      <ProductsPerformanceSection
        report={{
          rangeStart: '2026-04-01T00:00:00Z',
          rangeEnd: '2026-04-30T23:59:59Z',
          bestSeller: {
            productId: '1',
            productName: 'Arroz',
            totalUnitsSold: 10,
            totalRevenue: 200,
          },
          topProducts: [
            {
              productId: '1',
              productName: 'Arroz',
              totalUnitsSold: 10,
              totalRevenue: 200,
            },
          ],
          topRevenueProducts: [
            {
              productId: '2',
              productName: 'Aceite',
              totalUnitsSold: 5,
              totalRevenue: 300,
            },
          ],
          lowRotationProducts: [
            {
              productId: '3',
              productName: 'Vinagre',
              totalUnitsSold: 1,
              totalRevenue: 20,
            },
          ],
          categories: [
            {
              categoryName: 'Despensa',
              totalUnitsSold: 10,
              totalRevenue: 200,
            },
          ],
        }}
      />
    );

    expect(screen.getByTestId('reports-products-section')).toBeInTheDocument();
    expect(screen.getAllByText('Arroz').length).toBeGreaterThan(0);
    expect(screen.getByText('Despensa')).toBeInTheDocument();
    expect(screen.getByText('Aceite')).toBeInTheDocument();
    expect(screen.getByText('Vinagre')).toBeInTheDocument();
  });

  it('renders empty product highlight state', () => {
    render(
      <ProductsPerformanceSection
        report={{
          rangeStart: '2026-04-01T00:00:00Z',
          rangeEnd: '2026-04-30T23:59:59Z',
          bestSeller: null,
          topProducts: [],
          topRevenueProducts: [],
          lowRotationProducts: [],
          categories: [],
        }}
      />
    );

    expect(screen.getByText(/Sin producto líder/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin categorías activas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sin datos comparativos/i)).toHaveLength(3);
  });
});
