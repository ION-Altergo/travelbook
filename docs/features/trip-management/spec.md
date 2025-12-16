# Trip Management Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Create, view, edit, and delete on-site engineering trips with team member assignments, dates, locations, and status tracking.

**Scope**:
- **In scope**: Trip CRUD operations, status workflow, filtering/search, data table view, sidebar editing, default user assignment
- **Out of scope**: Calendar integration, trip approval workflows, conflict detection, resource allocation, notifications

## 2. Architecture

### Entrypoints
- `app/trips/page.tsx > TripsPage()` - Main trips listing and management
- `components/trip-sidebar.tsx > TripSidebar()` - Edit/create sidebar
- `contexts/data-context.tsx > { addTrip, updateTrip, deleteTrip }` - Trip state management
- `lib/data.ts > { getTripDuration, getTripsByEngineer }` - Trip utilities

### Invariants
- Every trip has exactly one assigned team member
- Trip start date must be defined
- Trip end date must be >= start date
- Trip status is one of: planned, confirmed, in-progress, completed, cancelled
- Newly created trips default to current user as assignee
- Trip IDs are unique and immutable

### Stable contracts
- **Trip type**: `{ id, engineerId, projectName, location, startDate, endDate, status, notes? }`
- **Trip status enum**: planned | confirmed | in-progress | completed | cancelled
- **Context API**: `addTrip(trip)`, `updateTrip(id, partial)`, `deleteTrip(id)`

### File map
```
/app/trips/                          # Trips page with table
/components/trip-sidebar.tsx         # Edit/create sidebar
/contexts/data-context.tsx           # Trip state management
/lib/data.ts                         # Trip utilities and initial data
/types/index.ts                      # Trip type definition
```

### Main flow
1. User navigates to /trips
2. Trips filtered by search, status, and team member
3. User clicks "New Trip" button
4. Default trip created with current user assigned
5. Sidebar opens for editing
6. User fills in project name, location, dates, status
7. User clicks "Save" - trip updated in state
8. Table refreshes with new trip
9. User can click any row to edit in sidebar

### Key components
- `TripsPage` - Data table with filters and trip management
- `TripSidebar` - Form for editing trip details with date pickers
- `DataProvider.addTrip()` - Generates ID, adds to trips array
- `DataProvider.updateTrip()` - Updates trip in state
- `getTripDuration()` - Calculates days including start and end

## 3. Interfaces

### API surface

**`useData() > trips`** (Stable)
- Inputs: None
- Outputs: `Trip[]` all trips (not filtered by team)
- Usage: All components displaying trips
- Note: Filtering by team member is UI-level, not data-level

**`addTrip(trip: Omit<Trip, 'id'>)`** (Stable)
- Inputs: Trip data without ID
- Outputs: void (updates state)
- Side effects: Generates unique ID, adds to trips array
- ID format: `trip-${timestamp}-${random}`

**`updateTrip(id: string, trip: Partial<Trip>)`** (Stable)
- Inputs: Trip ID and partial update object
- Outputs: void (updates state)
- Side effects: Merges partial into existing trip
- Errors: Silent if ID not found

**`deleteTrip(id: string)`** (Stable)
- Inputs: Trip ID
- Outputs: void (updates state)
- Side effects: Removes trip from array
- Note: No confirmation in API, UI prompts user

**`getTripDuration(trip: Trip): number`** (Stable)
- Inputs: Trip object
- Outputs: Number of days (inclusive of start and end)
- Formula: `ceil((end - start) / (24 * 60 * 60 * 1000)) + 1`

## 4. Data and state

### Primary models
- **Trip**: In-memory React state
  - `id` (string, unique, generated)
  - `engineerId` (string, required, FK to Engineer)
  - `projectName` (string, required)
  - `location` (string, required)
  - `startDate` (Date, required)
  - `endDate` (Date, required)
  - `status` (enum, required, default: 'planned')
  - `notes` (string, optional)

### Storage
- Initial data from `lib/data.ts > trips`
- Runtime state in DataProvider's useState
- No persistence (resets on page reload)

### State lifecycle
- **Created**: Via "New Trip" button → `addTrip(defaultTrip)`
- **Read**: Via `useData().trips` in tables, timelines, reports
- **Updated**: Via sidebar "Save" → `updateTrip(id, formData)`
- **Deleted**: Via sidebar "Delete" → `deleteTrip(id)` after confirmation

### Important fields
- `engineerId`: Must match existing engineer ID for display
- `startDate/endDate`: Used for timeline rendering and duration calculation
- `status`: Affects styling (badges, colors) and filtering

## 5. Edge cases and limits

### Handled cases
- Default trip has current user as assignee
- Duration includes both start and end dates (inclusive)
- Can change team member assignment after creation
- Empty state message when no trips match filters
- Sidebar closes on save or cancel
- Delete requires user confirmation
- Dates displayed in user-friendly format (MMM d, yyyy)

### Current limitations
- No validation that end date >= start date
- No conflict detection (same person, overlapping dates)
- No trip templates or duplication
- Cannot bulk edit or delete trips
- No trip history or audit log
- Status transitions not enforced (can go from planned to completed directly)
- No attachment support
- No cost/budget tracking per trip (only expenses linked separately)
- Table not sortable
- No pagination (all trips load at once)

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Create trip defaults to current user
- Edit trip updates in table immediately
- Delete trip removes from list
- Filtering by status works
- Filtering by team member works
- Search by project name and location works
- Duration calculation is correct
- Sidebar opens/closes correctly
- Date picker handles valid date ranges
- Mobile sidebar overlay works

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**:
- Trip creation with current user default
- Sidebar editing and saving
- Trip deletion with confirmation
- Filtering by status and team member
- Search functionality
- Mobile responsive design
- Table overflow scrolling

