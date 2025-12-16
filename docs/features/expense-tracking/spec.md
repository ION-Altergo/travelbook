# Expense Tracking Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Track and manage expenses for engineering trips with categorization, multi-currency support, and team member association.

**Scope**:
- **In scope**: Expense CRUD, categorization by type, currency selection, trip linkage, filtering/search, summary cards
- **Out of scope**: Receipt uploads, expense approval, reimbursement tracking, currency conversion, budget limits, expense policies

## 2. Architecture

### Entrypoints
- `app/expenses/page.tsx > ExpensesPage()` - Main expenses listing and management
- `components/expense-dialog.tsx > ExpenseDialog()` - Create/edit expense modal
- `contexts/data-context.tsx > { addExpense, updateExpense, deleteExpense }` - Expense state
- `lib/data.ts > getExpensesByTrip()` - Expense utilities

### Invariants
- Every expense is associated with one trip and one team member
- Expense amount must be non-negative
- Expense date must be defined
- Currency is one of: EUR, USD, INR, GBP
- Type is one of: travel, accommodation, meals, transportation, other
- Expense IDs are unique and immutable

### Stable contracts
- **Expense type**: `{ id, tripId, engineerId, type, amount, currency, date, description? }`
- **Expense type enum**: travel | accommodation | meals | transportation | other
- **Currency enum**: EUR | USD | INR | GBP
- **Context API**: `addExpense(expense)`, `updateExpense(id, partial)`, `deleteExpense(id)`

### File map
```
/app/expenses/                       # Expenses page with table
/components/expense-dialog.tsx       # Create/edit dialog
/contexts/data-context.tsx           # Expense state management
/lib/data.ts                         # Expense utilities and initial data
/types/index.ts                      # Expense type definition
```

### Main flow
1. User navigates to /expenses
2. Summary cards show total, count, and average per expense type
3. Expenses filtered by search, type, and team member
4. User clicks "Add Expense" button
5. Dialog opens with empty form
6. User selects trip, team member, type, amount, currency, date
7. User saves - expense added to state
8. Table refreshes with new expense
9. Summary cards update

### Key components
- `ExpensesPage` - Table with filters and summary cards
- `ExpenseDialog` - Form for expense details with dropdowns
- `DataProvider.addExpense()` - Generates ID, adds to expenses
- `getExpensesByTrip()` - Helper to filter expenses by trip ID

## 3. Interfaces

### API surface

**`useData() > expenses`** (Stable)
- Inputs: None
- Outputs: `Expense[]` all expenses
- Usage: Expense listing, reports, calculations

**`addExpense(expense: Omit<Expense, 'id'>)`** (Stable)
- Inputs: Expense data without ID
- Outputs: void (updates state)
- Side effects: Generates unique ID, adds to expenses array
- ID format: `expense-${timestamp}-${random}`

**`updateExpense(id: string, expense: Partial<Expense>)`** (Stable)
- Inputs: Expense ID and partial update
- Outputs: void (updates state)
- Side effects: Merges partial into existing expense

**`deleteExpense(id: string)`** (Stable)
- Inputs: Expense ID
- Outputs: void (updates state)
- Side effects: Removes expense from array

**`getExpensesByTrip(tripId: string): Expense[]`** (Stable)
- Inputs: Trip ID
- Outputs: Array of expenses for that trip
- Usage: Trip cost calculations, trip detail views

## 4. Data and state

### Primary models
- **Expense**: In-memory React state
  - `id` (string, unique, generated)
  - `tripId` (string, required, FK to Trip)
  - `engineerId` (string, required, FK to Engineer)
  - `type` (enum, required)
  - `amount` (number, required, >= 0)
  - `currency` (enum, required, default: EUR)
  - `date` (Date, required)
  - `description` (string, optional)

### Storage
- Initial data from `lib/data.ts > expenses`
- Runtime state in DataProvider's useState
- No persistence (resets on page reload)

### State lifecycle
- **Created**: Via "Add Expense" → dialog → `addExpense()`
- **Read**: Via `useData().expenses` in tables and reports
- **Updated**: Via edit dialog → `updateExpense()` (not currently in UI)
- **Deleted**: Via `deleteExpense()` (not currently in UI)

### Important fields
- `tripId`: Must reference existing trip for display
- `engineerId`: Must reference existing engineer for display
- `amount`: No currency conversion, stored as-entered
- `currency`: Display-only, no conversion logic

## 5. Edge cases and limits

### Handled cases
- Summary cards show totals by type
- Average expense calculated across all expenses
- Empty state when no expenses match filters
- Date displayed in user-friendly format
- Trip name and location shown in table
- Team member color indicator in table

### Current limitations
- No edit or delete UI (APIs exist but not exposed)
- No receipt attachments
- No currency conversion (amounts stored as-is)
- No validation on amount (could be 0 or negative)
- No expense approval workflow
- No reimbursement tracking
- Cannot link expense to multiple trips
- No expense categories beyond predefined types
- No bulk import/export
- Table not sortable
- No pagination
- No expense total per trip in trip view
- No budget limits or warnings

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Create expense and see in table
- Filter by type works
- Filter by team member works
- Search by description works
- Summary cards calculate correctly
- Trip dropdown shows only user's trips
- Team member dropdown shows only team
- Date picker works
- Currency selection persists
- Mobile responsive table scrolling

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**:
- Expense creation flow
- Filtering and search
- Summary card calculations
- Trip and team member associations
- Table display with colors
- Mobile responsiveness

