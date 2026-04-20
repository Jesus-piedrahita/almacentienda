import { describe, expect, it } from 'vitest';

import {
  getNextTransfersPageParam,
  mapApiTransferProofSummary,
  transferQueryKeys,
} from './use-transfers';

describe('mapApiTransferProofSummary', () => {
  it('mapea proof_mime_type a proofMimeType', () => {
    const mapped = mapApiTransferProofSummary({
      id: 10,
      status: 'pending',
      proof_url: 'https://storage.local/proof.jpg',
      proof_mime_type: 'image/jpeg',
      proof_filename: 'proof.jpg',
      reference_note: 'REF-10',
      client_name: 'Juan Pérez',
      sale_context: {
        sale_id: 100,
        created_at: '2026-04-20T10:00:00Z',
        total: 250000,
        items: [
          {
            product_name: 'Aceite',
            quantity: 2,
            unit_price: 125000,
            subtotal: 250000,
          },
        ],
      },
      created_at: '2026-04-20T10:00:00Z',
      uploaded_at: '2026-04-20T10:00:00Z',
      validated_at: null,
      validated_by_user_id: null,
      sale_id: 7,
      debt_payment_id: null,
    });

    expect(mapped.proofMimeType).toBe('image/jpeg');
    expect(mapped.proofUrl).toBe('https://storage.local/proof.jpg');
    expect(mapped.id).toBe('10');
    expect(mapped.clientName).toBe('Juan Pérez');
    expect(mapped.saleContext?.saleId).toBe('100');
    expect(mapped.saleContext?.items[0].productName).toBe('Aceite');
  });

  it('maneja proof_mime_type null', () => {
    const mapped = mapApiTransferProofSummary({
      id: 11,
      status: 'pending',
      proof_url: null,
      proof_mime_type: null,
      proof_filename: null,
      reference_note: null,
      client_name: null,
      sale_context: null,
      created_at: '2026-04-20T10:00:00Z',
      uploaded_at: null,
      validated_at: null,
      validated_by_user_id: null,
      sale_id: null,
      debt_payment_id: null,
    });

    expect(mapped.proofMimeType).toBeNull();
    expect(mapped.proofUrl).toBeNull();
    expect(mapped.clientName).toBeNull();
    expect(mapped.saleContext).toBeNull();
  });

  it('deriva la siguiente página cuando todavía hay más resultados', () => {
    expect(
      getNextTransfersPageParam({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      })
    ).toBe(2);
  });

  it('no deriva siguiente página cuando ya llegó al final', () => {
    expect(
      getNextTransfersPageParam({
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 20,
          totalPages: 2,
        },
      })
    ).toBeUndefined();
  });

  it('usa query keys separadas por status procesado', () => {
    expect(transferQueryKeys.history('confirmed')).toEqual(['transfers', 'history', 'confirmed']);
    expect(transferQueryKeys.history('rejected')).toEqual(['transfers', 'history', 'rejected']);
  });
});
