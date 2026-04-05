# Inventory UI Specification

## Purpose

Defines the behavior and user interface requirements for the Inventory page, specifically focusing on the Stock Status and Category Chart sections during initial data loading and error states.

## Requirements

### Requirement: Stock Status Initial Loading State

The system MUST display a skeleton loader instead of empty data (`0 / 0 / 0`) when fetching inventory statistics for the first time.

#### Scenario: Initial Load

- GIVEN the user navigates to the Inventory page
- WHEN the inventory statistics are being fetched for the first time (no cache)
- THEN the Stock Status Indicator component MUST render a skeleton UI
- AND the skeleton UI height MUST match the expected height of the populated component to prevent layout shifts.

### Requirement: Category Chart Initial Loading State

The system MUST display a skeleton loader instead of the "No hay categorías con productos" message when fetching category statistics for the first time.

#### Scenario: Initial Load

- GIVEN the user navigates to the Inventory page
- WHEN the category statistics are being fetched for the first time (no cache)
- THEN the Category Chart component MUST render a skeleton UI
- AND the skeleton UI height MUST match the expected height of the populated component to prevent layout shifts.

### Requirement: Stock Status Error State

The system MUST display a clear error message with a retry mechanism if the inventory statistics fail to load.

#### Scenario: Network Error or Server Error

- GIVEN the user is on the Inventory page
- WHEN the fetch request for inventory statistics fails
- THEN the Stock Status Indicator component MUST render an error message indicating the failure
- AND a retry button MUST be provided to attempt fetching the data again.

### Requirement: Background Refetching (isFetching)

The system SHOULD NOT display the initial loading skeleton during background refetches.

#### Scenario: Background Cache Update

- GIVEN the user has already loaded the inventory statistics
- WHEN the application refetches data in the background (e.g., window focus)
- THEN the existing data MUST remain visible
- AND the skeleton UI MUST NOT be shown.
