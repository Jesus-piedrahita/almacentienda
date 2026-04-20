import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransferProofThumbnail } from './transfer-proof-thumbnail';
import type { TransferProofSummary } from '@/types/transfers';

function makeSummary(overrides: Partial<TransferProofSummary> = {}): TransferProofSummary {
  return {
    id: '1',
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

describe('TransferProofThumbnail', () => {
  it('renderiza thumbnail de imagen y permite click', () => {
    const onClick = vi.fn();
    render(<TransferProofThumbnail summary={makeSummary()} onClick={onClick} />);

    const image = screen.getByRole('img', { name: /proof.jpg/i });
    expect(image).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ver comprobante de imagen/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renderiza affordance PDF', () => {
    render(
      <TransferProofThumbnail
        summary={makeSummary({ proofMimeType: 'application/pdf', proofUrl: 'https://storage.local/proof.pdf' })}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument();
  });

  it('renderiza estado vacío si no hay comprobante', () => {
    render(
      <TransferProofThumbnail
        summary={makeSummary({ proofUrl: null, proofMimeType: null, proofFilename: null })}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText(/sin comprobante/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
