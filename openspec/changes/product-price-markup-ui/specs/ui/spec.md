# Product Price Markup UI Specification

## Purpose

This specification defines the behavior for a local UI helper that calculates selling price based on cost and a markup percentage (and vice versa) within the product add/edit dialogs. This is a UI-only feature that MUST NOT affect backend data structures or API payloads.

## Requirements

### Requirement: Local Markup State Management

The product form UI MUST maintain a local state for markup percentage (`markupPct`) that is strictly used for UI calculations and MUST NOT be included in the final payload sent to the backend.

#### Scenario: Submitting a product form

- GIVEN a user has entered a cost, markup percentage, and other product details
- WHEN the user submits the product form
- THEN the system MUST send only the standard fields (including the derived price and the cost)
- AND the system MUST NOT include the `markupPct` in the API payload

### Requirement: Markup Helper Logic (Price from Markup)

The UI MUST calculate the derived selling price dynamically when the user provides a cost and a markup percentage. The helper logic SHALL reside in `src/lib/markup.ts`.

#### Scenario: Calculating price from cost and markup

- GIVEN a valid product cost greater than 0
- WHEN the user inputs a markup percentage
- THEN the system MUST calculate the derived price as `cost * (1 + (markup / 100))`
- AND the system MUST update the price input field with the calculated value

### Requirement: Markup Helper Logic (Markup from Price)

The UI MUST calculate the derived markup percentage dynamically when the user manually edits the selling price.

#### Scenario: Calculating markup from cost and manual price

- GIVEN a valid product cost greater than 0
- WHEN the user manually edits the selling price
- THEN the system MUST calculate the derived markup as `((price - cost) / cost) * 100`
- AND the system MUST update the markup percentage input field with the calculated value

### Requirement: Safe Handling of Zero Cost

The system MUST handle a cost of `0` gracefully to prevent mathematical errors like `NaN` or `Infinity`.

#### Scenario: Calculating markup when cost is zero

- GIVEN a product cost of `0`
- WHEN the user manually inputs a selling price
- THEN the system MUST allow the manual price entry
- AND the system MUST NOT calculate a markup percentage (or it MAY display `0` or remain empty, but MUST NOT crash)

### Requirement: Test Coverage

The system MUST include automated tests for the markup helper utility and the affected UI dialogs.

#### Scenario: Verifying test coverage

- GIVEN the implementation of the markup helper and the updated product dialogs
- WHEN the test suite is executed
- THEN tests for `src/lib/markup.ts` MUST pass
- AND tests for the Add and Edit product dialogs MUST pass, verifying the dynamic calculation and payload shape
