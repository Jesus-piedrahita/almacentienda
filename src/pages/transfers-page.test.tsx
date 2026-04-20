import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransfersPage } from './transfers-page';

vi.mock('@/components/transfers/transfer-validation-panel', () => ({
  TransferValidationPanel: () => <div>Panel de pendientes mock</div>,
}));

vi.mock('@/components/transfers/transfer-history-panel', () => ({
  TransferHistoryPanel: () => <div>Panel de historial mock</div>,
}));

describe('TransfersPage', () => {
  it('muestra tanto pendientes como historial en la misma pantalla', () => {
    render(<TransfersPage />);

    expect(screen.getByRole('heading', { name: /pendientes por validar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /historial reciente/i })).toBeInTheDocument();
    expect(screen.getByText(/panel de pendientes mock/i)).toBeInTheDocument();
    expect(screen.getByText(/panel de historial mock/i)).toBeInTheDocument();
  });
});
