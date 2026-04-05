# Proposal: Fix Stock Status Initial Load

## Intent

Fix the visual bug where the "Estado del Stock" (Stock Status) and category charts appear as empty (showing `0 / 0 / 0` or "No categories") during the initial data fetch on the Inventory page. This creates a confusing user experience where the user might think the inventory is empty or the system failed, instead of understanding that the data is simply loading.

## Scope

### In Scope
- Add `isLoading` and `isError` props to `StockStatusIndicator` component.
- Add `isLoading` prop to `CategoryChart` component.
- Implement skeleton loaders for both components when `isLoading` is true.
- Implement an error state with a retry option for `StockStatusIndicator` when `isError` is true.
- Pass the existing `isLoading` (and `isError` where applicable) states from `useInventoryStats()` to these components in `inventory-page.tsx`.

### Out of Scope
- Creating a global `<AsyncSection>` wrapper for all components.
- Refactoring the entire page to use React 19 Suspense and Error Boundaries.
- Modifying backend endpoints or React Query hooks logic.

## Approach

We will use the **Minimum Prop Drilling (Opción A)** approach. We will extend the prop contracts of `StockStatusIndicator` and `CategoryChart` to accept `isLoading` and `isError` boolean flags. When `isLoading` is true, these components will render an inline skeleton (similar to the existing pattern in `InventoryStatsCards`). When `isError` is true (for the stock status), it will render an error message with a retry button.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/inventory/stock-status-indicator.tsx` | Modified | Add `isLoading`/`isError` props, skeleton UI, and error UI |
| `src/components/inventory/category-chart.tsx` | Modified | Add `isLoading` prop and skeleton UI |
| `src/pages/inventory-page.tsx` | Modified | Pass `isLoadingStats` and `isError` to the aforementioned components |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Layout shift when skeleton transitions to real data | Medium | Ensure the skeleton's fixed height exactly matches the rendered component's height. |
| Masking `isFetching` background updates | Low | We only use the `isLoading` flag from React Query (which is true only on initial load without cache), avoiding blocking the UI during background refetches. |

## Rollback Plan

Revert the changes in `inventory-page.tsx` to stop passing the new props, and revert the changes in `StockStatusIndicator` and `CategoryChart` to their previous state where they only accepted data props. This is a purely presentational change and reverting it will not affect data integrity.

## Dependencies

- None. This relies on existing React Query states and UI components.

## Success Criteria

- [ ] On initial load, the Stock Status block shows a skeleton instead of `0 / 0 / 0`.
- [ ] On initial load, the Category Chart shows a skeleton instead of "No hay categorías con productos".
- [ ] If the stats fetch fails, the Stock Status block displays a clear error message with a retry mechanism.
- [ ] No layout shifts occur when the skeleton is replaced by actual data.