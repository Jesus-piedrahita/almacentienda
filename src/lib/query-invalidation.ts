import type { QueryClient } from '@tanstack/react-query';

type InvalidationOptions = {
  includeInventory?: boolean;
  includeClients?: boolean;
  includeReports?: boolean;
  includeSales?: boolean;
  includeTransfers?: boolean;
  includeCategories?: boolean;
  includeProductSearch?: boolean;
  clientId?: string;
};

export async function invalidateOperationalQueries(
  queryClient: QueryClient,
  options: InvalidationOptions = {}
): Promise<void> {
  const {
    includeInventory = true,
    includeClients = true,
    includeReports = true,
    includeSales = true,
    includeTransfers = false,
    includeCategories = false,
    includeProductSearch = false,
    clientId,
  } = options;

  const invalidations: Array<Promise<void>> = [];

  if (includeSales) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['sales'], refetchType: 'active' })
    );
  }

  if (includeInventory) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'active' }),
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'], refetchType: 'active' }),
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'], refetchType: 'active' }),
      queryClient.invalidateQueries({ queryKey: ['inventory-expiring'], refetchType: 'active' })
    );
  }

  if (includeCategories) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'active' })
    );
  }

  if (includeProductSearch) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['products', 'search'], refetchType: 'active' })
    );
  }

  if (includeClients) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['clients'], refetchType: 'active' }),
      queryClient.invalidateQueries({ queryKey: ['clients', 'stats'], refetchType: 'active' })
    );

    if (clientId) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: ['clients', clientId], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'debts'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'credit-account'], refetchType: 'active' })
      );
    }
  }

  if (includeReports) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['reports'], refetchType: 'active' })
    );
  }

  if (includeTransfers) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['transfers'], refetchType: 'active' })
    );
  }

  await Promise.all(invalidations);
}
