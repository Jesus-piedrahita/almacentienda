import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportsLegend } from './reports-legend';

describe('ReportsLegend', () => {
  it('renders all legend items', () => {
    render(
      <ReportsLegend
        items={[
          { colorClassName: 'bg-primary', label: 'Fiado' },
          { colorClassName: 'bg-emerald-500', label: 'Abonado' },
        ]}
      />
    );

    expect(screen.getByText('Fiado')).toBeInTheDocument();
    expect(screen.getByText('Abonado')).toBeInTheDocument();
  });
});
