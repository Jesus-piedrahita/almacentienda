import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';

import { RegisterPaymentModal } from './register-payment-modal';

const mutateAsync = vi.fn();

vi.mock('@/hooks/use-clients', () => ({
  useRegisterPayment: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('RegisterPaymentModal', () => {
  it('bloquea submit con monto inválido', () => {
    render(
      <RegisterPaymentModal open onOpenChange={vi.fn()} clientId="1" saleId="10" saleLabel="Venta #10" maxAmount={100} />,
      { wrapper: makeWrapper() }
    );

    expect(screen.getByRole('button', { name: /guardar abono/i })).toBeDisabled();
  });

  it('envía monto válido', async () => {
    mutateAsync.mockResolvedValueOnce(undefined);

    render(
      <RegisterPaymentModal open onOpenChange={vi.fn()} clientId="1" saleId="10" saleLabel="Venta #10" maxAmount={100} />,
      { wrapper: makeWrapper() }
    );

    fireEvent.change(screen.getByLabelText(/monto del abono/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/nota/i), { target: { value: 'Efectivo' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar abono/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ saleId: '10', amount: 50, note: 'Efectivo' });
    });
  });
});
