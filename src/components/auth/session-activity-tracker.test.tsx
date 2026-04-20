import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';

import { SessionActivityTracker } from './session-activity-tracker';
import { useAuthStore } from '@/stores/auth-store';

const trackMutation = {
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/hooks/use-auth', () => ({
  useTrackSessionActivity: () => trackMutation,
}));

describe('SessionActivityTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    trackMutation.mutateAsync.mockClear();
    useAuthStore.setState({
      user: { id: 1, email: 'user@test.com', is_active: true, created_at: '2026-04-20T00:00:00Z' },
      token: 'token',
      sessionId: 'session-1',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits page_view on authenticated route mount', async () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <SessionActivityTracker />
      </MemoryRouter>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(trackMutation.mutateAsync).toHaveBeenCalledWith({
      eventType: 'page_view',
      route: '/reports',
    });
  });

  it('emits heartbeat every 2 minutes while authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <SessionActivityTracker />
      </MemoryRouter>
    );

    await vi.advanceTimersByTimeAsync(2 * 60 * 1000);

    expect(trackMutation.mutateAsync).toHaveBeenCalledWith({
      eventType: 'heartbeat',
      route: '/dashboard',
    });
  });
});
