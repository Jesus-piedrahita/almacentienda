import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransferProofPreviewModal } from './transfer-proof-preview-modal';
import type { TransferProofSummary } from '@/types/transfers';

function makeProof(overrides: Partial<TransferProofSummary> = {}): TransferProofSummary {
  return {
    id: '20',
    status: 'pending',
    proofUrl: 'https://storage.local/proof.jpg',
    proofMimeType: 'image/jpeg',
    proofFilename: 'proof.jpg',
    referenceNote: null,
    clientName: null,
    saleContext: null,
    createdAt: '2026-04-20T12:00:00Z',
    uploadedAt: null,
    validatedAt: null,
    validatedByUserId: null,
    saleId: null,
    debtPaymentId: null,
    ...overrides,
  };
}

describe('TransferProofPreviewModal', () => {
  it('muestra imagen para MIME image/*', () => {
    render(<TransferProofPreviewModal open onOpenChange={vi.fn()} proof={makeProof()} />);

    expect(screen.getByRole('img', { name: /proof.jpg/i })).toBeInTheDocument();
  });

  it('muestra iframe para MIME application/pdf', () => {
    render(
      <TransferProofPreviewModal
        open
        onOpenChange={vi.fn()}
        proof={makeProof({
          proofUrl: 'https://storage.local/proof.pdf',
          proofMimeType: 'application/pdf',
          proofFilename: 'proof.pdf',
        })}
      />
    );

    expect(screen.getByTitle(/comprobante #20/i)).toBeInTheDocument();
  });

  it('muestra estado de error y fallback link cuando falla la imagen', () => {
    render(<TransferProofPreviewModal open onOpenChange={vi.fn()} proof={makeProof()} />);

    const image = screen.getByRole('img', { name: /proof.jpg/i });
    fireEvent.error(image);

    expect(screen.getByText(/vista previa no disponible/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^abrir comprobante$/i })).toBeInTheDocument();
  });
});
