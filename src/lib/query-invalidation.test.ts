import { describe, expect, it, vi } from 'vitest';

import { invalidateOperationalQueries } from './query-invalidation';

describe('invalidateOperationalQueries', () => {
  it('invalidates operational namespaces in parallel with active refetch', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const queryClient = { invalidateQueries };

    await invalidateOperationalQueries(queryClient as never, { includeTransfers: true });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['sales'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['products'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['inventory-stats'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['inventory-low-stock'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['inventory-expiring'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients', 'stats'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['reports'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['transfers'], refetchType: 'active' });
  });

  it('can include categories and product search namespaces when requested', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const queryClient = { invalidateQueries };

    await invalidateOperationalQueries(queryClient as never, {
      includeInventory: true,
      includeCategories: true,
      includeProductSearch: true,
      includeClients: false,
      includeReports: false,
      includeSales: false,
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['products', 'search'], refetchType: 'active' });
  });

  it('invalidates client detail namespaces when clientId is provided', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const queryClient = { invalidateQueries };

    await invalidateOperationalQueries(queryClient as never, {
      includeClients: true,
      includeInventory: false,
      includeReports: true,
      includeSales: false,
      clientId: '42',
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients', '42'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients', '42', 'debts'], refetchType: 'active' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients', '42', 'credit-account'], refetchType: 'active' });
  });
});
