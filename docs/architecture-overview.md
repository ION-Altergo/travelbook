# Travelbook Architecture Overview

## System Purpose

Travelbook is a web application for managing on-site engineering trips, tracking team members, recording expenses, and generating reports. Built for French engineering teams working with international clients, particularly in India.

## High-Level Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Deployment**: Vercel

### Architecture Pattern
- **Frontend**: Server-rendered React with client-side hydration
- **State**: In-memory (no database, resets on refresh)
- **Auth**: OAuth with session cookies
- **Routing**: File-based (Next.js App Router)
- **Data Flow**: Unidirectional (Context → Components)

## Core Features

Feature documentation follows `/docs/feature-spec-guidelines.md`. Each feature has a dedicated spec:

1. **Authentication** → `/docs/features/authentication/spec.md`
   - Google OAuth login
   - Team isolation by email domain
   - Session management

2. **Team Management** → `/docs/features/team-management/spec.md`
   - Auto-creation of logged-in users
   - Domain-based team filtering
   - Team member profiles

3. **Trip Management** → `/docs/features/trip-management/spec.md`
   - CRUD operations for trips
   - Status workflow
   - Team member assignment

4. **Expense Tracking** → `/docs/features/expense-tracking/spec.md`
   - Multi-currency expense recording
   - Trip linkage
   - Categorization

5. **Timeline Visualization** → `/docs/features/timeline-visualization/spec.md`
   - Detailed and aggregated views
   - Multiple time granularities
   - Visual trip planning

6. **Reports & Analytics** → `/docs/features/reports-analytics/spec.md`
   - Period-based reporting
   - Team member breakdowns
   - Expense analysis

## System-Wide Invariants

### Authentication
- All routes except `/login` require authentication
- Users cannot access other teams' data (isolated by email domain)

### Data Integrity
- Every trip must have exactly one assigned team member
- Every expense must link to one trip and one team member
- IDs are unique and immutable within their entity type
- Dates are stored as JavaScript Date objects

### Team Isolation
- Team = all users with same email domain
- Team members can only see their own team's data
- Domain extracted from email via `email.split('@')[1]`

### State Management
- All data is in-memory (no database)
- State resets on page refresh (except logged-in user auto-recreates)
- Context API provides global state access
- No optimistic updates (state changes are synchronous)

## Data Model

### Core Types (defined in `types/index.ts`)

```typescript
Engineer {
  id: string
  name: string
  email: string (unique, used for domain extraction)
  role: string
  dailyRate: number
  color: string (hex, derived from email hash)
}

Trip {
  id: string
  engineerId: string (FK to Engineer)
  projectName: string
  location: string
  startDate: Date
  endDate: Date
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
}

Expense {
  id: string
  tripId: string (FK to Trip)
  engineerId: string (FK to Engineer)
  type: 'travel' | 'accommodation' | 'meals' | 'transportation' | 'other'
  amount: number
  currency: 'EUR' | 'USD' | 'INR' | 'GBP'
  date: Date
  description?: string
}
```

### Relationships
- Engineer 1:N Trip (one engineer, many trips)
- Engineer 1:N Expense (one engineer, many expenses)
- Trip 1:N Expense (one trip, many expenses)
- No database constraints (enforced in UI only)

## File Structure

```
/app/                           # Next.js pages (App Router)
  /(auth)/
    /login/                     # Login page (public)
  /                            # Dashboard (protected)
  /trips/                      # Trip management (protected)
  /engineers/                  # Team listing (protected)
  /expenses/                   # Expense tracking (protected)
  /reports/                    # Reporting (protected)
  /api/auth/[...nextauth]/    # OAuth callbacks

/components/                    # React components
  /ui/                         # shadcn/ui primitives
  timeline-view.tsx            # Detailed timeline
  aggregated-timeline.tsx      # Aggregated timeline
  trip-sidebar.tsx             # Trip editor sidebar
  expense-dialog.tsx           # Expense form dialog
  user-nav.tsx                 # User profile dropdown
  nav.tsx                      # Main navigation
  nav-wrapper.tsx              # Server-side nav wrapper

/contexts/                      # React Context providers
  data-context.tsx             # Global state (trips, expenses, engineers)

/lib/                          # Utilities and helpers
  data.ts                      # Initial data + helper functions
  utils.ts                     # Utility functions (cn, etc.)

/types/                        # TypeScript definitions
  index.ts                     # Core data models

/auth.ts                       # NextAuth instance
/auth.config.ts                # NextAuth configuration
/middleware.ts                 # Auth middleware (route protection)

/docs/                         # Documentation
  /features/                   # Feature specs
  architecture-overview.md     # This file
  feature-spec-guidelines.md   # Spec template rules
```

## Request Flow

### Authenticated Request
1. User makes request to protected route
2. `middleware.ts` checks for session
3. If no session → redirect to `/login`
4. If session exists → allow request to continue
5. Page server component calls `auth()` to get session
6. Session passed to `DataProvider`
7. `DataProvider` filters data by domain, auto-creates user
8. Page renders with user-specific data

### Login Flow
1. User visits `/login`
2. Clicks "Sign in with Google"
3. Server action calls `signIn('google')`
4. Redirect to Google OAuth
5. User authorizes
6. Google redirects to `/api/auth/callback/google`
7. NextAuth creates session with user info
8. Domain extracted in session callback
9. Redirect to `/` (dashboard)
10. User appears in engineers list

## State Management

### Data Context (`contexts/data-context.tsx`)

**Provides**:
- `engineers: Engineer[]` - Filtered by domain + current user
- `trips: Trip[]` - All trips (UI-level filtering)
- `expenses: Expense[]` - All expenses (UI-level filtering)
- `currentUser: { email, name, domain } | null`
- CRUD methods for trips and expenses
- Engineer management methods

**Initialization**:
- Receives session from layout
- Extracts current user info
- Filters initial engineers by domain
- Auto-creates engineer for current user if not exists
- Provides state via Context API

**Usage**:
```typescript
const { engineers, trips, expenses, currentUser, addTrip, ... } = useData();
```

## Environment Configuration

### Required Variables
- `NEXTAUTH_URL` - Application URL (http://localhost:3001 or production)
- `NEXTAUTH_SECRET` - Secret key for session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Development
- Local: `.env.local` file
- Port: 3001 (configurable)

### Production (Vercel)
- Environment variables set in Vercel dashboard
- Auto-deployment on git push
- URL: https://travelbook-orcin.vercel.app

## Security Model

### Authentication
- Google OAuth only (no passwords)
- Session stored in HTTP-only cookie
- Session expiration: 30 days (NextAuth default)

### Authorization
- No role-based access control
- All authenticated users have same permissions
- Team isolation enforced by domain filtering
- No cross-team data access possible

### Data Privacy
- No data persistence (in-memory only)
- Session data encrypted by NextAuth
- No PII stored beyond session duration
- HTTPS enforced in production

## Known Limitations

### Persistence
- No database (all data in memory)
- Data resets on page refresh
- Sample data reloads on startup
- Only current user persists (auto-recreated)

### Scalability
- Single instance (no horizontal scaling)
- No caching layer
- All data loaded on startup
- No pagination (all records loaded)

### Features
- No email notifications
- No file uploads (receipts)
- No PDF/Excel export
- No calendar integration
- No approval workflows
- No budget tracking
- No currency conversion
- No audit logging

### Mobile
- Responsive design, but no native app
- Some features hidden on small screens
- No offline support

## Testing Status

- **Unit tests**: None implemented
- **Integration tests**: None implemented
- **E2E tests**: None implemented
- **Manual testing**: All features verified as of 2025-12-16

## Deployment

### Build Process
```bash
npm run build    # Next.js production build
npm run start    # Production server
```

### Deployment Platform
- **Vercel**: Auto-deploy on git push to main
- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Install command**: `npm install`

### Environment Setup
1. Configure Google OAuth in Google Cloud Console
2. Add environment variables in Vercel dashboard
3. Deploy via git push or Vercel CLI
4. Verify OAuth redirect URIs match production URL

## Future Considerations

### Potential Enhancements
- Database persistence (PostgreSQL/Supabase)
- PDF report generation
- Email notifications
- Calendar integration
- Mobile app (React Native)
- Role-based access control
- Budget tracking and alerts
- Receipt upload and storage
- Multi-team membership
- Custom date ranges in reports

### Scaling Concerns
- Need database for production use
- Consider Redis for session storage
- Implement pagination for large datasets
- Add search indexing for better performance
- Consider background jobs for reports

## Support and Maintenance

### Documentation Updates
- Update feature specs when architecture changes
- Follow `/docs/feature-spec-guidelines.md`
- Keep this overview in sync with feature specs
- Document breaking changes

### Version Control
- Git repository: https://github.com/ION-Altergo/travelbook
- Main branch: protected, deployed to production
- Feature branches: for new development
- Commit messages: conventional commits format

### Monitoring
- Vercel analytics and logs
- No application-level monitoring currently
- Manual testing before releases

---

**Last Updated**: 2025-12-16  
**Next Review**: When major architectural changes occur

