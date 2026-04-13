import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportsVisualState } from './reports-visual-state';

describe('ReportsVisualState', () => {
  it('renders empty variant content', () => {
    render(
      <ReportsVisualState
        variant="empty"
        title="Sin datos"
        description="No hay nada para mostrar"
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('renders error variant action', () => {
    render(
      <ReportsVisualState
        variant="error"
        title="Error"
        description="Falló la carga"
        action={<button type="button">Reintentar</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
