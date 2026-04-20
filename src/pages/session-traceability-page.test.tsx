import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionTraceabilityPage } from './session-traceability-page';

const mockTraces = [
  {
    sessionId: 'session-1',
    userId: 1,
    userEmail: 'ana@test.com',
    startedAt: '2026-04-20T10:00:00Z',
    lastSeenAt: '2026-04-20T10:05:00Z',
    endedAt: null,
    endReason: null,
    replacedBySessionId: null,
    isActive: true,
    durationSeconds: 300,
    latestActivityAt: '2026-04-20T10:05:00Z',
    latestActivityType: 'heartbeat' as const,
    visitedRoutes: ['/', '/reports'],
  },
  {
    sessionId: 'session-2',
    userId: 1,
    userEmail: 'ana@test.com',
    startedAt: '2026-04-20T08:00:00Z',
    lastSeenAt: '2026-04-20T08:15:00Z',
    endedAt: '2026-04-20T08:16:00Z',
    endReason: 'replaced_by_new_login' as const,
    replacedBySessionId: 'session-1',
    isActive: false,
    durationSeconds: 960,
    latestActivityAt: '2026-04-20T08:15:00Z',
    latestActivityType: 'page_view' as const,
    visitedRoutes: ['/inventory'],
  },
];

const mockDetail = {
  ...mockTraces[0],
  ipAddress: '127.0.0.1',
  userAgent: 'vitest',
  activities: [
    {
      id: 1,
      eventType: 'page_view' as const,
      route: '/reports',
      occurredAt: '2026-04-20T10:01:00Z',
      metadata: {},
    },
    {
      id: 2,
      eventType: 'heartbeat' as const,
      route: '/reports',
      occurredAt: '2026-04-20T10:03:00Z',
      metadata: {},
    },
  ],
};

vi.mock('@/hooks/use-auth', () => ({
  useSessionTraces: () => ({
    data: mockTraces,
    isLoading: false,
  }),
  useSessionTraceDetail: (sessionId: string | null) => ({
    data: sessionId ? mockDetail : null,
    isLoading: false,
  }),
}));

describe('SessionTraceabilityPage', () => {
  it('renders the dedicated inspection questions in one screen', () => {
    render(<SessionTraceabilityPage />);

    expect(screen.getByText('Trazabilidad de sesiones')).toBeInTheDocument();
    expect(screen.getByText('Sesiones registradas')).toBeInTheDocument();
    expect(screen.getByText('Detalle de sesión')).toBeInTheDocument();
    expect(screen.getByTestId('session-detail-scroll-container')).toBeInTheDocument();
    expect(screen.getAllByText('/reports').length).toBeGreaterThan(0);
    expect(screen.getByText(/Sesión activa actual/i)).toBeInTheDocument();
  });

  it('allows switching the selected session from the list', () => {
    render(<SessionTraceabilityPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalle' })[1]);

    expect(screen.getAllByRole('button', { name: 'Ver detalle' })).toHaveLength(2);
  });
});
