import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLogout } from './use-auth';
import * as apiModule from '@/lib/api';

vi.mock('@/lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof apiModule>();
  return {
    ...original,
    logoutSession: vi.fn(),
  };
});

const mockedLogoutSession = vi.mocked(apiModule.logoutSession);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears auth and session-related query cache after logout succeeds', async () => {
    mockedLogoutSession.mockResolvedValue(undefined);

    const queryClient = makeQueryClient();
    const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const { result } = renderHook(() => useLogout(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(cancelQueriesSpy).toHaveBeenCalled();
    expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: ['currentUser'] });
    expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: ['session-traceability'] });
    expect(clearSpy).toHaveBeenCalled();
  });
});
