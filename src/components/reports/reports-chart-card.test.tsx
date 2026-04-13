import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportsChartCard } from './reports-chart-card';

describe('ReportsChartCard', () => {
  it('renders title, description and content', () => {
    render(
      <ReportsChartCard title="Cobranza" description="Serie principal" headerAside={<span>Meta</span>}>
        <div>Contenido del chart</div>
      </ReportsChartCard>
    );

    expect(screen.getByText('Cobranza')).toBeInTheDocument();
    expect(screen.getByText('Serie principal')).toBeInTheDocument();
    expect(screen.getByText('Meta')).toBeInTheDocument();
    expect(screen.getByText('Contenido del chart')).toBeInTheDocument();
  });
});
