# Google Authentication Setup Guide

## 📋 Prerequisites

You need to set up Google OAuth credentials before the authentication will work.

## 🔑 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the project name

### Step 2: Enable Google+ API

1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **Internal** (for company use) or **External**
   - App name: **Travelbook**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Travelbook**
   - Authorized JavaScript origins:
     - `http://localhost:3001` (for local development)
     - `http://localhost:3000` (if using port 3000)
     - `https://travelbook-orcin.vercel.app` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google` (local)
     - `http://localhost:3000/api/auth/callback/google` (local alt)
     - `https://travelbook-orcin.vercel.app/api/auth/callback/google` (production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

> **Important**: You need to add BOTH local and production URLs to the same OAuth client for it to work in both environments.

### Step 4: Generate NextAuth Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output as your `NEXTAUTH_SECRET`.

### Step 5: Update .env.local

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<paste-generated-secret-here>
GOOGLE_CLIENT_ID=<paste-client-id-here>
GOOGLE_CLIENT_SECRET=<paste-client-secret-here>
```

## 🌐 Production Deployment (Vercel)

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **travelbook** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://travelbook-orcin.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `<same-secret-as-local>` | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | `<your-client-id>` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `<your-client-secret>` | Production, Preview, Development |

> **Tip**: Use the same `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` for all environments. Only `NEXTAUTH_URL` changes per environment.

### Step 2: Redeploy

After adding environment variables:

```bash
# Option 1: Push to trigger auto-deployment
git add .
git commit -m "Configure production auth"
git push

# Option 2: Manually redeploy from Vercel dashboard
# Go to Deployments → Click "..." → Redeploy
```

### Step 3: Test Production Login

1. Visit [https://travelbook-orcin.vercel.app](https://travelbook-orcin.vercel.app)
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Authorize the app
5. You should be redirected back to the dashboard

### Production URL Configuration

Your production app is deployed at: **https://travelbook-orcin.vercel.app**

Make sure this URL is added to:
- ✅ Google Cloud Console OAuth redirect URIs
- ✅ Vercel environment variable `NEXTAUTH_URL`

## 🎯 Team/Domain Configuration

The application automatically determines teams by email domain:

- Users with `@company.fr` emails will see only engineers with `@company.fr` emails
- Users with `@example.com` emails will see only engineers with `@example.com` emails
- Each domain is a separate team

### Adding Engineers

Currently, engineers are defined in `lib/data.ts`. Make sure engineer emails match your team's domain:

```typescript
export const engineers: Engineer[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@company.fr', // ← Domain determines team
    role: 'Senior Electrical Engineer',
    dailyRate: 800,
    color: '#3b82f6',
  },
  // ... more engineers
];
```

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. Use **Internal** OAuth consent screen for company-only access
3. Restrict domains in Google Cloud Console if needed
4. For production, use environment variables from your hosting provider

## ✅ Testing Authentication

1. Ensure `.env.local` is configured
2. Restart the dev server: `npm run dev`
3. Navigate to `http://localhost:3001`
4. You should be redirected to `/login`
5. Click "Sign in with Google"
6. Authorize the app
7. You'll be redirected back to the dashboard

## 🎨 Features

### Automatic User Detection
- When logged in, your name appears in the top-right corner
- Your email determines your team (by domain)

### Default Engineer Selection
- When adding a new trip, your name is pre-selected as the engineer
- You can still select other team members from the dropdown

### Team Filtering
- Only engineers from your domain are visible
- Trips and expenses are filtered by your team

## 🚨 Troubleshooting

### "Error: NEXTAUTH_SECRET is not set"
- Make sure `.env.local` exists and has `NEXTAUTH_SECRET`
- Restart the dev server after creating/editing `.env.local`

### "Error: Invalid OAuth credentials"
- Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Ensure redirect URI matches exactly: `http://localhost:3001/api/auth/callback/google`

### "Access blocked: This app's request is invalid"
- Enable Google+ API in Google Cloud Console
- Configure OAuth consent screen
- Add authorized redirect URIs

### "Can't see my team members"
- Ensure engineer emails match your domain
- Check that engineers are defined in `lib/data.ts`
- Verify your logged-in email domain

### Production Issues

#### "Works locally but not in production"
1. Check Vercel environment variables are set correctly
2. Verify `NEXTAUTH_URL` is set to `https://travelbook-orcin.vercel.app`
3. Ensure production redirect URI is added in Google Cloud Console
4. Check Vercel deployment logs for errors

#### "Redirect URI mismatch in production"
- Go to Google Cloud Console → Credentials
- Edit your OAuth client
- Add: `https://travelbook-orcin.vercel.app/api/auth/callback/google`
- Wait a few minutes for changes to propagate

#### "Environment variables not working in Vercel"
- Make sure to select **Production**, **Preview**, and **Development** when adding variables
- Redeploy after adding environment variables
- Check **Settings** → **Environment Variables** to verify they're saved

## 📖 Quick Reference

### Local Development
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### Production (Vercel)
```bash
# Environment Variables in Vercel Dashboard
NEXTAUTH_URL=https://travelbook-orcin.vercel.app
NEXTAUTH_SECRET=<same-as-local>
GOOGLE_CLIENT_ID=<same-as-local>
GOOGLE_CLIENT_SECRET=<same-as-local>
```

### Google OAuth Redirect URIs
Both of these must be added to your OAuth client:
- ✅ `http://localhost:3001/api/auth/callback/google`
- ✅ `https://travelbook-orcin.vercel.app/api/auth/callback/google`

### Google OAuth Origins
Both of these should be added as authorized origins:
- ✅ `http://localhost:3001`
- ✅ `https://travelbook-orcin.vercel.app`

## 📖 Next Steps

After authentication is working:

1. Add real engineer data matching your team's emails
2. Configure production OAuth credentials
3. Set up database for persistent data (optional)
4. Deploy to your hosting provider

---

**Questions?** Check the [NextAuth.js documentation](https://authjs.dev/) for more details.

