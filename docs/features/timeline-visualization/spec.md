# Timeline Visualization Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Visual timeline showing trip assignments across time periods with two modes: detailed (day-by-day) and aggregated (day counts per period).

**Scope**:
- **In scope**: Day/week/month/quarter/year views, detailed and aggregated modes, color-coded team members, period navigation, current period highlighting
- **Out of scope**: Drag-and-drop editing, conflict warnings, zoom controls, print view, export to calendar, multi-team view

## 2. Architecture

### Entrypoints
- `app/page.tsx > Home()` - Dashboard with timeline toggle and controls
- `components/timeline-view.tsx > TimelineView()` - Detailed day-by-day timeline
- `components/aggregated-timeline.tsx > AggregatedTimeline()` - Day count per period view
- `lib/data.ts > calculateEngineerDaysInPeriod()` - Day counting utility

### Invariants
- Timeline always shows data for current selected period
- Each team member has one row
- Team member colors are consistent across all views
- Day counts include both start and end dates (inclusive)
- Current period is visually highlighted
- Period labels match selected granularity

### Stable contracts
- **Timeline view types**: day | week | month | quarter | year
- **View modes**: aggregated | detailed
- **TimelineView props**: `{ trips, engineers, currentDate, viewType }`
- **AggregatedTimeline props**: `{ trips, engineers, currentDate, aggregationType }`

### File map
```
/app/page.tsx                        # Dashboard with toggle
/components/timeline-view.tsx        # Detailed timeline
/components/aggregated-timeline.tsx  # Aggregated timeline
/lib/data.ts                         # Day calculation utilities
```

### Main flow
1. User lands on dashboard
2. Timeline defaults to aggregated view, month granularity, current date
3. Toggle switches between aggregated and detailed modes
4. Granularity selector changes time period scale
5. Navigation buttons move forward/backward through time
6. Timeline renders with current period highlighted
7. Each team member row shows their trip assignments
8. Hover shows additional trip details

### Key components
- `Home` - Controls (toggle, navigation, granularity selector)
- `TimelineView` - Renders day-by-day grid with colored blocks for trips
- `AggregatedTimeline` - Renders period boxes with day counts
- `calculateEngineerDaysInPeriod()` - Counts overlap between trips and date range

## 3. Interfaces

### API surface

**`<TimelineView />`** (Stable)
- Props:
  - `trips: Trip[]` - All trips to display
  - `engineers: Engineer[]` - Team members (determines rows)
  - `currentDate: Date` - Center date for the view
  - `viewType: 'day' | 'week' | 'month' | 'quarter' | 'year'`
- Renders: Grid of days with colored trip blocks
- Layout: Engineer names in left column, time periods across top

**`<AggregatedTimeline />`** (Stable)
- Props:
  - `trips: Trip[]`
  - `engineers: Engineer[]`
  - `currentDate: Date`
  - `aggregationType: 'week' | 'month' | 'quarter' | 'year'`
- Renders: Boxes with day counts per period
- Layout: Engineer names in left column, periods across top

**`calculateEngineerDaysInPeriod(engineerId, startDate, endDate, trips): number`** (Stable)
- Inputs: Engineer ID, date range, trips array
- Outputs: Total days that engineer has trips in range (inclusive)
- Handles: Overlapping trips, partial overlaps with period
- Formula: Sums overlap days for each trip in range

## 4. Data and state

### Primary models
- **No persistent state** - Pure rendering based on props
- **Derived data**:
  - Period intervals: Calculated from `currentDate` and granularity
  - Day assignments: Calculated from trip start/end dates
  - Overlap counts: Calculated per engineer per period

### State in parent (app/page.tsx)
- `currentDate` - Controls what time period is visible
- `timelineView` - Granularity (day/week/month/quarter/year)
- `showAggregated` - Toggle between modes

### State lifecycle
- **Read**: Trips and engineers from DataProvider
- **Computed**: Period intervals from date-fns functions
- **Rendered**: Visual blocks based on date overlaps

## 5. Edge cases and limits

### Handled cases
- Trips spanning multiple periods show in all relevant boxes
- Multi-year view (year granularity shows 5 years)
- Current period highlighted with different background
- Empty rows for team members with no trips
- Partial month overlaps counted correctly
- Day view shows full month of days
- Year view shows all 12 months
- Week numbers displayed in week view

### Current limitations
- No tooltip on hover showing trip details
- Cannot click on timeline to create/edit trips
- No legend explaining colors
- Long team member names may truncate
- No indication of trip status on timeline
- Multiple overlapping trips for same person not shown distinctly
- No zoom in/out controls
- Very long time periods may have small boxes
- No export or sharing of timeline view
- No way to see which specific trip a block represents
- Week view starts Monday (not configurable)

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Day counts match trip durations
- Period navigation updates view correctly
- Current period highlighted in all views
- Aggregated totals match detailed day counts
- Team member filtering works
- Colors consistent across views
- Edge case: trip spans year boundary
- Edge case: multiple trips same person same day
- Responsive layout on mobile
- Toggle switches between modes correctly

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**:
- Both timeline modes render correctly
- Day/week/month/quarter/year granularities work
- Period navigation functional
- Current period highlighting
- Day count calculations accurate
- Mobile responsive scrolling
- Toggle between modes

