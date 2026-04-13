import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportsSectionHeader } from './reports-section-header';

describe('ReportsSectionHeader', () => {
  it('renders title, description and optional aside', () => {
    render(
      <ReportsSectionHeader
        title="Resumen ejecutivo"
        description="KPIs del período"
        aside={<button type="button">Acción</button>}
      />
    );

    expect(screen.getByText('Resumen ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('KPIs del período')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
  });
});
