# Reports & Analytics Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Generate reports showing trip and expense breakdowns by team member, time period, and expense type for internal analysis and customer reporting.

**Scope**:
- **In scope**: Period filtering (month/quarter/year), team member filtering, tabbed views (by member/by expense/by trip), summary statistics, data tables
- **Out of scope**: PDF/Excel export, custom date ranges, charts/graphs, historical comparisons, budget vs actual, forecasting

## 2. Architecture

### Entrypoints
- `app/reports/page.tsx > ReportsPage()` - Main reports interface
- `lib/data.ts > { getTripDuration, getEngineerById, getExpensesByTrip }` - Report data utilities

### Invariants
- Reports always show data for selected period and filters
- Totals match sum of individual rows
- Team member filter applies across all tabs
- Period filter applies across all tabs
- Date ranges calculated from period selection (month/quarter/year)

### Stable contracts
- **Period enum**: month | quarter | year
- **Tab types**: engineer | expenses | trips
- **Summary metrics**: Total trips, total days, total expenses
- **Breakdown structure**: Per-engineer stats with totals row

### File map
```
/app/reports/                        # Reports page
/lib/data.ts                         # Report calculation utilities
```

### Main flow
1. User navigates to /reports
2. Page defaults to current month, all team members
3. Summary cards show high-level metrics for selected period
4. User selects period (month/quarter/year)
5. Date range calculated from current date + period
6. Trips and expenses filtered by date range
7. User optionally filters by specific team member
8. User switches between tabs to see different breakdowns
9. Tables show filtered data with totals

### Key components
- `ReportsPage` - Main component with filters and tabs
- Summary cards - Show total trips, days, expenses for period
- Team member breakdown tab - Per-engineer stats
- Expense breakdown tab - Per-type totals with percentages
- Trip details tab - Full trip list with durations

## 3. Interfaces

### API surface

**Reports page filters** (Stable)
- Period selector: month | quarter | year
- Team member selector: all | specific engineer ID
- Both filters apply to all tabs simultaneously

**Summary metrics** (Stable)
- Total trips in period
- Total days (sum of trip durations in period)
- Total expenses (sum of expense amounts in period)

**Team member breakdown** (Stable)
- Columns: Team Member | Trips | Days | Expenses
- Calculated per engineer for filtered period
- Includes totals row

**Expense breakdown** (Stable)
- Groups expenses by type
- Shows amount and percentage of total per type
- Progress bar visual for percentages

**Trip details** (Stable)
- Columns: Project | Team Member | Location | Duration | Dates | Status
- Shows all trips in period
- Team member names with color indicators

## 4. Data and state

### Primary models
- **No persistent state** - Pure calculation from trips/expenses

### Computed data
- `filteredTrips`: Trips within date range + optional engineer filter
- `filteredExpenses`: Expenses within date range + optional engineer filter
- `engineerBreakdown`: Per-engineer aggregation of trips/days/expenses
- `expensesByType`: Grouping of expenses by type with totals
- `totalDays`: Sum of durations for filtered trips
- `totalExpenses`: Sum of amounts for filtered expenses

### State in component
- `period` - Currently selected period (month/quarter/year)
- `selectedEngineerId` - Filter for specific engineer or "all"
- `start` / `end` - Computed date range from period + current date

### Calculations
- Period date ranges: date-fns functions (startOfMonth, startOfQuarter, etc.)
- Trip filtering: `tripStart <= periodEnd && tripEnd >= periodStart`
- Expense filtering: `expenseDate >= periodStart && expenseDate <= periodEnd`
- Duration summing: Sum of `getTripDuration(trip)` for filtered trips

## 5. Edge cases and limits

### Handled cases
- Trips spanning period boundaries counted in all overlapping periods
- Expenses matched to trips for context
- Empty state when no data for period
- Totals row always shown
- Percentages calculated correctly even with 0 total
- All team members option shows aggregate across team

### Current limitations
- No custom date range selection
- Cannot compare multiple periods side-by-side
- No export to PDF or Excel
- No charts or visualizations (only tables)
- No drill-down from summary to details
- Cannot save or bookmark report configurations
- No email/sharing of reports
- No budget vs actual comparisons
- No forecasting or trends
- No filtering by trip status
- No filtering by expense type in main view
- Salary/labor costs removed (not shown)
- No grouping by customer/project
- No multi-currency conversion

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Period filter updates all tabs
- Team member filter updates all tabs
- Summary metrics match table totals
- Trip count matches filtered trips
- Expense totals match filtered expenses
- Percentages sum to 100%
- Empty states show when no data
- Date range calculation correct for each period type
- Trips on period boundaries counted correctly

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**:
- Period filtering works across all tabs
- Team member filtering works
- Summary cards calculate correctly
- Three tabs display appropriate data
- Totals rows accurate
- Terminology updated to "Team Member"
- Mobile responsive tables scroll

