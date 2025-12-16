# 🔐 Authentication & Team Management Update

## Overview

Google OAuth authentication has been implemented with automatic team management based on email domains. This update enables secure access and ensures team members only see data relevant to their organization.

## ✨ New Features

### 1. **Google OAuth Login**
- Secure authentication using company Google accounts
- Login page with Google sign-in button
- Protected routes requiring authentication
- User avatar and profile display in navigation

### 2. **Team-Based Access Control**
- Teams are automatically determined by email domain
- Example: `@company.fr` users form one team
- Engineers are filtered by matching domain
- Only see trips and data for your team

### 3. **Smart Trip Creation**
- Current logged-in user is automatically selected when creating a new trip
- Can still assign trips to other team members
- Engineer dropdown only shows team members

### 4. **User Profile Display**
- User avatar in top-right corner
- Dropdown menu showing:
  - Full name
  - Email address
  - Sign out option

## 🏗️ Technical Implementation

### Files Added

1. **`auth.config.ts`** - NextAuth configuration with Google provider
2. **`auth.ts`** - NextAuth instance and exports
3. **`middleware.ts`** - Route protection and authentication middleware
4. **`app/api/auth/[...nextauth]/route.ts`** - NextAuth API handlers
5. **`app/login/page.tsx`** - Login page with Google sign-in
6. **`components/user-nav.tsx`** - User profile dropdown component
7. **`components/nav-wrapper.tsx`** - Server component wrapper for nav
8. **`AUTH_SETUP.md`** - Detailed setup instructions

### Files Modified

1. **`components/nav.tsx`** - Added user profile support
2. **`app/layout.tsx`** - Made async, integrated auth session
3. **`contexts/data-context.tsx`** - Added team filtering by domain
4. **`app/trips/page.tsx`** - Default to current user for new trips

## 🔧 Configuration Required

Before the authentication works, you need to:

1. **Create `.env.local` file** with:
   ```env
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=<generate-with-openssl>
   GOOGLE_CLIENT_ID=<from-google-cloud>
   GOOGLE_CLIENT_SECRET=<from-google-cloud>
   ```

2. **Set up Google Cloud OAuth**:
   - Create project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`

3. **Generate secret**:
   ```bash
   openssl rand -base64 32
   ```

See **`AUTH_SETUP.md`** for detailed step-by-step instructions.

## 🎯 How It Works

### Team Filtering Logic

```typescript
// Extract domain from email
const domain = session.user.email.split('@')[1]; // e.g., "company.fr"

// Filter engineers by domain
const teamEngineers = engineers.filter(eng => 
  eng.email.endsWith(`@${domain}`)
);
```

### Default Engineer Selection

```typescript
// Find current user's engineer record
const currentEngineer = engineers.find(e => 
  e.email === currentUser?.email
);

// Use as default when creating trip
const defaultTrip = {
  engineerId: currentEngineer?.id || engineers[0]?.id,
  // ... other fields
};
```

## 🔒 Security Features

1. **Middleware Protection**
   - All routes except `/login` require authentication
   - Unauthenticated users redirected to login page
   - Authenticated users on login page redirected to dashboard

2. **Session Management**
   - User info stored in session
   - Domain extracted and added to session
   - Secure token handling via NextAuth

3. **Team Isolation**
   - Data filtered by email domain
   - No cross-team data access
   - Automatic team detection

## 🚀 User Experience Flow

1. **First Visit**
   - User navigates to app
   - Middleware detects no session
   - Redirects to `/login`

2. **Login**
   - Click "Sign in with Google"
   - OAuth flow to Google
   - Authorize application
   - Redirect back with session

3. **Dashboard**
   - User sees their avatar in nav
   - Only team members visible
   - Name pre-selected for new trips

4. **Sign Out**
   - Click avatar → Sign out
   - Session cleared
   - Redirect to login

## 📊 Sample Data

Current sample engineers all have `@company.fr` domain:

```typescript
{
  name: 'Marie Dubois',
  email: 'marie.dubois@company.fr',
  role: 'Senior Electrical Engineer',
}
```

To test multi-team:
1. Add engineers with different domains (e.g., `@acme.com`)
2. Log in with matching Google account
3. See filtered data by domain

## 🧪 Testing Checklist

- [ ] Create Google OAuth credentials
- [ ] Configure `.env.local`
- [ ] Restart dev server
- [ ] Visit app (should redirect to login)
- [ ] Sign in with Google
- [ ] See user avatar in nav
- [ ] Create new trip (should default to your name)
- [ ] Verify team filtering (only see matching domain engineers)
- [ ] Sign out (should redirect to login)

## 🔮 Future Enhancements

1. **Database Integration**
   - Store users and teams in database
   - Persist trip assignments
   - Add role-based permissions

2. **Team Management**
   - Admin can add/remove team members
   - Invite users to team
   - Custom team names

3. **Advanced Permissions**
   - View-only vs edit permissions
   - Project-specific access
   - Manager approval workflows

4. **Multi-Domain Support**
   - Users part of multiple teams
   - Switch between teams
   - Cross-team collaboration

## 📖 Dependencies Added

```json
{
  "next-auth": "^5.0.0-beta" // NextAuth v5 with App Router support
}
```

## 🎨 UI Components Used

- **Avatar** - User profile picture
- **DropdownMenu** - Profile menu
- **Card** - Login page design
- **Button** - Sign in action

## 💡 Best Practices

1. **Never commit `.env.local`** - Contains sensitive credentials
2. **Use HTTPS in production** - Secure token transmission
3. **Restrict OAuth domains** - Company email only
4. **Regular secret rotation** - Update `NEXTAUTH_SECRET` periodically
5. **Monitor login attempts** - Google Cloud Console audit logs

## 🆘 Troubleshooting

See **`AUTH_SETUP.md`** for common issues and solutions:
- Invalid OAuth credentials
- Redirect URI mismatch
- Missing environment variables
- Team filtering not working

---

**Next Steps:** Follow `AUTH_SETUP.md` to configure Google OAuth and start using the authenticated application!

