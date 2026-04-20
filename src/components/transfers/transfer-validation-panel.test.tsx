import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransferValidationPanel } from './transfer-validation-panel';

vi.mock('@/hooks/use-transfers', () => ({
  useTransfers: vi.fn(),
  useValidateTransfer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const { useTransfers } = await import('@/hooks/use-transfers');

describe('TransferValidationPanel - contexto de cliente y venta', () => {
  it('renderiza cliente y detalle de venta cuando existe saleContext', () => {
    vi.mocked(useTransfers).mockReturnValue({
      data: {
        data: [
          {
            id: '1',
            status: 'pending',
            proofUrl: 'https://storage.local/proof.jpg',
            proofMimeType: 'image/jpeg',
            proofFilename: 'proof.jpg',
            referenceNote: 'REF-1',
            clientName: 'Juan Pérez',
            saleContext: {
              saleId: '88',
              createdAt: '2026-04-20T12:00:00Z',
              total: 90000,
              items: [
                {
                  productName: 'Arroz Premium',
                  quantity: 2,
                  unitPrice: 45000,
                  subtotal: 90000,
                },
              ],
            },
            createdAt: '2026-04-20T12:00:00Z',
            uploadedAt: null,
            validatedAt: null,
            validatedByUserId: null,
            saleId: null,
            debtPaymentId: '70',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
    } as ReturnType<typeof useTransfers>);

    render(<TransferValidationPanel />);

    expect(screen.getByText(/cliente: juan pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/venta #88/i)).toBeInTheDocument();
    expect(screen.getByText(/ítems de la venta/i)).toBeInTheDocument();
    expect(screen.getByText(/arroz premium × 2/i)).toBeInTheDocument();
    expect(screen.getByText(/unitario:/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal:/i)).toBeInTheDocument();
  });

  it('renderiza fallback de legado para deuda sin venta asociada', () => {
    vi.mocked(useTransfers).mockReturnValue({
      data: {
        data: [
          {
            id: '2',
            status: 'pending',
            proofUrl: null,
            proofMimeType: null,
            proofFilename: null,
            referenceNote: 'REF-LEGACY',
            clientName: 'María Legacy',
            saleContext: null,
            createdAt: '2026-04-20T12:00:00Z',
            uploadedAt: null,
            validatedAt: null,
            validatedByUserId: null,
            saleId: null,
            debtPaymentId: '71',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
    } as ReturnType<typeof useTransfers>);

    render(<TransferValidationPanel />);

    expect(screen.getByText(/cliente: maría legacy/i)).toBeInTheDocument();
    expect(screen.getByText(/pago de deuda · sin venta asociada/i)).toBeInTheDocument();
    expect(screen.queryByText(/ítems de la venta/i)).not.toBeInTheDocument();
  });
});
