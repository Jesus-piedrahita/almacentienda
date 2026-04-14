# Proposal: Product Price Markup UI

## 1. Intent
Add a local "Markup %" helper to the add and edit product dialogs to make price calculation easier for users based on cost.

## 2. Motivation
Users often determine product selling prices by adding a standard markup percentage to the cost. Currently, they have to manually calculate this outside the system. Adding a markup helper in the UI will save time and reduce calculation errors.

## 3. Scope
**In Scope:**
*   Adding a UI-only markup helper field (`markupPct`) to product dialogs (Add/Edit).
*   Derived calculation: `cost` + `markupPct` => derived `price`.
*   Reverse calculation: manual `price` edit => derived `markupPct`.
*   Creating a standalone helper function in `src/lib/markup.ts` to encapsulate the logic.
*   Writing tests for the helper function and verifying both dialogs.
*   Safely handling `cost = 0` (no NaN/Infinity; manual price still allowed).

**Out of Scope:**
*   Backend changes, API updates, or database schema modifications.
*   Persisting `markupPct` in the database. The `markupPct` stays strictly as local UI state and must not be sent in backend payloads.

## 4. Approach
*   **Helper Module:** Implement the calculation logic in a new file `src/lib/markup.ts`. This ensures reusability and testability. It will handle the edge case of `cost = 0` by returning a `null` or `undefined` markup percentage if derived from price, or just allowing the price to be set manually.
*   **UI Components:** Update the existing Product Add and Edit dialogs (likely in `src/components/inventory/`). Add a new input field for the "Markup (%)".
*   **State Management:** Use local component state (or react-hook-form) to manage the `markupPct`. Ensure that changes to `cost` or `markupPct` update the `price`, and changes to `price` update the `markupPct`.
*   **API Payload Filtering:** Ensure that before submitting the form data to the backend, the `markupPct` field is explicitly excluded or just not included in the payload construction.
*   **Testing:** Write unit tests for the functions in `src/lib/markup.ts` and component tests for the dialogs to verify the bidirectional calculation and the 0 cost edge case.
