# Authentication Feature Spec

Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## 1. Overview

**What it does**: Provides Google OAuth-based authentication with automatic team assignment based on email domain.

**Scope**:
- **In scope**: Google OAuth login, session management, team/domain-based access control, auto-user creation
- **Out of scope**: Password-based auth, multi-factor auth, role-based permissions, user management UI

## 2. Architecture

### Entrypoints
- `auth.ts > auth()` - Main auth instance and session accessor
- `auth.config.ts > authConfig` - NextAuth configuration with Google provider
- `middleware.ts > default()` - Route protection middleware
- `app/api/auth/[...nextauth]/route.ts > { GET, POST }` - OAuth callback handlers
- `app/login/page.tsx > LoginPage()` - Login UI

### Invariants
- All routes except `/login` require authentication
- User's email domain determines their team
- Users are automatically added to engineers list on first login
- Session includes user email, name, and domain

### Stable contracts
- **Session object**: `{ user: { email, name, image, domain } }`
- **Google OAuth redirect URI**: `/api/auth/callback/google`
- **Environment variables**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### File map
```
/auth.ts                              # NextAuth instance
/auth.config.ts                       # Provider and callbacks config
/middleware.ts                        # Route protection
/app/api/auth/[...nextauth]/         # OAuth handlers
/app/login/                          # Login page
/components/user-nav.tsx             # User profile dropdown
/components/nav-wrapper.tsx          # Server-side nav with session
```

### Main flow
1. Unauthenticated user visits app
2. Middleware redirects to `/login`
3. User clicks "Sign in with Google"
4. OAuth flow to Google and back to callback
5. Session created with user info and domain extracted
6. User redirected to dashboard
7. DataProvider auto-creates engineer record if not exists

### Key components
- `auth()` - Server-side session accessor used in layouts and server components
- `authConfig.authorized()` - Callback that enforces authentication on all routes
- `authConfig.session()` - Enhances session with domain extracted from email
- `middleware()` - Intercepts requests to enforce auth before page render
- `UserNav` - Client component displaying user avatar and sign-out option

## 3. Interfaces

### API surface

**`POST /api/auth/signin/google`** (Stable)
- Inputs: None (form submission)
- Outputs: Redirect to Google OAuth
- Auth: None required
- Errors: 500 if Google credentials invalid

**`GET /api/auth/callback/google`** (Stable)
- Inputs: OAuth code from Google
- Outputs: Session cookie, redirect to `/`
- Auth: None (OAuth flow)
- Errors: Redirect to `/login` with error parameter

**`POST /api/auth/signout`** (Stable)
- Inputs: None
- Outputs: Clear session, redirect to `/login`
- Auth: Must be authenticated
- Errors: None

**`auth()` function** (Stable)
- Inputs: None
- Outputs: `{ user: { email, name, image, domain } } | null`
- Usage: Server components and API routes
- Returns: null if not authenticated

## 4. Data and state

### Primary models
- **Session**: Stored in NextAuth session cookie (encrypted)
  - `user.email` (string, required)
  - `user.name` (string, optional)
  - `user.image` (string, optional)
  - `user.domain` (string, derived from email)

### Storage
- Sessions stored in encrypted HTTP-only cookies
- No database persistence (stateless JWT sessions)
- Cookie name: `authjs.session-token` (production) or `authjs.session-token` (dev)

### State lifecycle
- **Created**: On successful Google OAuth callback
- **Updated**: On each request (session refresh)
- **Read**: Via `auth()` in server components, `useSession()` in client
- **Deleted**: On sign-out or session expiration

### Important fields
- `user.domain`: Extracted via `email.split('@')[1]`, used for team filtering
- `user.email`: Primary identifier, must be unique

## 5. Edge cases and limits

### Handled cases
- Users without name in Google profile: Falls back to email
- Multiple domains: Each domain is isolated team
- Session expiration: Auto-redirect to login
- Missing OAuth credentials: Error on server start
- Redirect loop prevention: Login page bypasses auth

### Current limitations
- No role-based access control (all users have same permissions)
- Cannot belong to multiple teams
- No user deactivation or blocking
- No audit log of login events
- Session duration is default NextAuth (30 days)
- No way to manually add users without them logging in first

## 6. Tests

### Where tests live
- No automated tests currently implemented

### Key scenarios to cover
- Login flow with valid Google account
- Auto-redirect when not authenticated
- Domain extraction from various email formats
- Session persistence across page reloads
- Sign-out clears session
- Engineer auto-creation on first login
- Team filtering by domain works correctly

## 7. Last verified

**Date**: 2025-12-16  
**Author**: AI Assistant  
**What was checked**: 
- Login flow working with Google OAuth
- Session management and middleware protection
- Domain extraction and team filtering
- Auto-user creation in DataProvider
- Sign-out functionality
- Production deployment configuration

