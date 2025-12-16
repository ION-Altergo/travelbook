# Team Management Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Manages team members (engineers) with automatic team filtering based on email domain and auto-creation of logged-in users.

**Scope**:
- **In scope**: Team member listing, filtering by domain, auto-creation from auth session, statistics display
- **Out of scope**: Manual user creation/editing, role management, team admin features, cross-team visibility

## 2. Architecture

### Entrypoints
- `app/engineers/page.tsx > EngineersPage()` - Team members listing UI
- `contexts/data-context.tsx > DataProvider()` - Team filtering and auto-creation logic
- `contexts/data-context.tsx > initializeEngineers` - Auto-add current user logic
- `lib/data.ts > engineers` - Sample/initial team member data

### Invariants
- Every logged-in user appears in their team's engineers list
- Engineers are filtered by email domain matching current user's domain
- Each engineer has a unique ID and email
- Engineer colors are deterministic based on email hash

### Stable contracts
- **Engineer type**: `{ id, name, email, role, dailyRate, color }`
- **Context API**: `{ engineers, currentUser, addEngineer, updateEngineer }`
- Domain extraction: `email.split('@')[1]`

### File map
```
/contexts/data-context.tsx           # Team filtering and state
/app/engineers/                      # Team listing page
/lib/data.ts                         # Initial data and helpers
/types/index.ts                      # Engineer type definition
/components/nav.tsx                  # "Team" navigation link
```

### Main flow
1. User logs in via Google OAuth
2. DataProvider receives session with email/name
3. Extract domain from email
4. Filter initial engineers by domain
5. Check if current user exists in filtered list
6. If not, auto-create engineer record with user's info
7. Engineer list available via useData() hook
8. Components display only team members from user's domain

### Key components
- `DataProvider.initializeEngineers` - Filters by domain and auto-adds current user
- `DataProvider.getUserColor()` - Generates consistent color from email hash
- `useData()` - Hook to access engineers list in components
- `EngineersPage` - Displays team member cards with stats

## 3. Interfaces

### API surface

**`useData() > engineers`** (Stable)
- Inputs: None (React context)
- Outputs: `Engineer[]` filtered by current user's domain
- Usage: All components needing team member data
- Auth: Must be within DataProvider

**`useData() > currentUser`** (Stable)
- Inputs: None
- Outputs: `{ email, name, domain } | null`
- Usage: Components needing current user info
- Returns: null if not authenticated

**`addEngineer(engineer: Omit<Engineer, 'id'>)`** (Internal)
- Inputs: Engineer data without ID
- Outputs: void (updates state)
- Side effects: Generates ID, adds to engineers array
- Usage: Future manual team member addition

**`updateEngineer(id: string, engineer: Partial<Engineer>)`** (Internal)
- Inputs: Engineer ID and partial update
- Outputs: void (updates state)
- Side effects: Updates matching engineer in state
- Usage: Future profile editing

## 4. Data and state

### Primary models
- **Engineer**: In-memory React state (no database persistence)
  - `id` (string, unique, generated as `eng-${timestamp}`)
  - `name` (string, from Google profile)
  - `email` (string, unique, from Google)
  - `role` (string, defaults to "Team Member")
  - `dailyRate` (number, defaults to 0)
  - `color` (string, hex color from hash)

### Storage
- Initial data from `lib/data.ts > engineers` array
- Runtime state in DataProvider's useState
- No persistence (resets on page reload to initial + current user)

### State lifecycle
- **Created**: On DataProvider mount if user not in filtered list
- **Read**: Via `useData().engineers` throughout app
- **Updated**: Via `updateEngineer()` (not currently used in UI)
- **Deleted**: Not supported

### Important fields
- `email`: Used for domain filtering and uniqueness check
- `color`: Derived from email via hash, used in UI visualizations
- `id`: Generated on creation, used as React keys and references

## 5. Edge cases and limits

### Handled cases
- User's first login creates engineer record automatically
- Users with same domain see each other
- Users with different domains are isolated
- Color generation is deterministic (same email = same color)
- Sample data filtered out if domain doesn't match

### Current limitations
- No persistence (engineers reset on refresh except auto-added user)
- Cannot manually add team members
- Cannot edit team member profiles
- Cannot remove team members
- No role-based permissions
- No team admin features
- Daily rate cannot be set by users
- No team size limits enforced
- No email validation beyond domain extraction

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Auto-creation of engineer on first login
- Domain filtering works correctly
- Multiple users from same domain all visible
- Users from different domains isolated
- Color generation is consistent
- Engineer appears in all dropdowns after creation
- Stats calculations include auto-created users

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**:
- Auto-creation of logged-in user works
- Domain filtering isolates teams
- Engineer appears in team page
- Engineer appears in trip/expense dropdowns
- Color generation is consistent
- Statistics display correctly

