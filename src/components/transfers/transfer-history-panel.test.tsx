import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TransferHistoryPanel } from './transfer-history-panel';

vi.mock('@/hooks/use-transfers', () => ({
  useInfiniteTransfers: vi.fn(),
}));

vi.mock('./transfer-proof-thumbnail', () => ({
  TransferProofThumbnail: ({ summary }: { summary: { id: string } }) => (
    <div>Comprobante {summary.id}</div>
  ),
}));

vi.mock('./transfer-proof-preview-modal', () => ({
  TransferProofPreviewModal: () => null,
}));

const { useInfiniteTransfers } = await import('@/hooks/use-transfers');

const baseHistoryResult = {
  isLoading: false,
  isError: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
};

function makeHistoryItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: '1',
    status: 'confirmed',
    proofUrl: 'https://storage.local/proof.jpg',
    proofMimeType: 'image/jpeg',
    proofFilename: 'proof.jpg',
    referenceNote: 'REF-1',
    clientName: 'Juan Pérez',
    saleContext: null,
    createdAt: '2026-04-20T12:00:00Z',
    uploadedAt: null,
    validatedAt: '2026-04-20T13:00:00Z',
    validatedByUserId: '9',
    saleId: null,
    debtPaymentId: null,
    ...overrides,
  };
}

beforeEach(() => {
  class IntersectionObserverMock {
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

describe('TransferHistoryPanel', () => {
  it('renderiza transferencias del historial y loading incremental', () => {
    vi.mocked(useInfiniteTransfers).mockReturnValue({
      ...baseHistoryResult,
      isFetchingNextPage: true,
      data: {
        pages: [
          {
            data: [makeHistoryItem({ id: '1' })],
            pagination: { page: 1, limit: 10, total: 2, totalPages: 2 },
          },
          {
            data: [makeHistoryItem({ id: '2', referenceNote: 'REF-2' })],
            pagination: { page: 2, limit: 10, total: 2, totalPages: 2 },
          },
        ],
      },
    } as never);

    render(<TransferHistoryPanel />);

    expect(screen.getByText(/transferencia #1/i)).toBeInTheDocument();
    expect(screen.getByText(/transferencia #2/i)).toBeInTheDocument();
    expect(screen.getByText(/cargando más transferencias/i)).toBeInTheDocument();
  });

  it('permite cambiar al filtro de rechazadas y muestra estado vacío local', () => {
    vi.mocked(useInfiniteTransfers).mockImplementation((status) => {
      if (status === 'rejected') {
        return {
          ...baseHistoryResult,
          data: {
            pages: [
              {
                data: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
              },
            ],
          },
        } as never;
      }

      return {
        ...baseHistoryResult,
        data: {
          pages: [
            {
              data: [makeHistoryItem()],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          ],
        },
      } as never;
    });

    render(<TransferHistoryPanel />);

    fireEvent.click(screen.getByRole('button', { name: /rechazadas/i }));

    expect(screen.getByText(/no hay transferencias rechazadas todavía/i)).toBeInTheDocument();
  });

  it('muestra error local y permite reintentar', () => {
    const refetch = vi.fn();

    vi.mocked(useInfiniteTransfers).mockReturnValue({
      ...baseHistoryResult,
      isError: true,
      refetch,
      data: undefined,
    } as never);

    render(<TransferHistoryPanel />);

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(screen.getByText(/no pudimos cargar el historial/i)).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
