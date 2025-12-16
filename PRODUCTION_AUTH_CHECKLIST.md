# 🚀 Production Authentication Setup Checklist

Quick checklist to enable Google OAuth on your production site: **https://travelbook-orcin.vercel.app**

## ✅ Step-by-Step Checklist

### 1. Google Cloud Console Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to **APIs & Services** → **Credentials**
- [ ] Find your OAuth client (or create one if you haven't)
- [ ] Click **Edit** on your OAuth client

#### Add Production URLs

- [ ] Under **Authorized JavaScript origins**, add:
  ```
  https://travelbook-orcin.vercel.app
  ```

- [ ] Under **Authorized redirect URIs**, add:
  ```
  https://travelbook-orcin.vercel.app/api/auth/callback/google
  ```

- [ ] Click **Save**

### 2. Vercel Environment Variables

- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your **travelbook** project
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add these variables (if not already added):

#### Required Variables

| Variable Name | Value | Select Environments |
|--------------|-------|---------------------|
| `NEXTAUTH_URL` | `https://travelbook-orcin.vercel.app` | ✅ Production |
| `NEXTAUTH_SECRET` | `<your-generated-secret>` | ✅ Production ✅ Preview ✅ Development |
| `GOOGLE_CLIENT_ID` | `<from-google-cloud>` | ✅ Production ✅ Preview ✅ Development |
| `GOOGLE_CLIENT_SECRET` | `<from-google-cloud>` | ✅ Production ✅ Preview ✅ Development |

> **Note**: Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 3. Redeploy to Vercel

After adding/updating environment variables, you MUST redeploy:

**Option A: From Dashboard**
- [ ] Go to **Deployments** tab
- [ ] Click the **"..."** menu on the latest deployment
- [ ] Click **Redeploy**
- [ ] Wait for deployment to complete

**Option B: From Terminal**
- [ ] Commit any pending changes
  ```bash
  git add .
  git commit -m "Configure production auth"
  ```
- [ ] Push to trigger auto-deployment
  ```bash
  git push
  ```

### 4. Test Production Login

- [ ] Visit [https://travelbook-orcin.vercel.app](https://travelbook-orcin.vercel.app)
- [ ] You should see the login page
- [ ] Click **"Sign in with Google"**
- [ ] Complete the Google OAuth flow
- [ ] You should be redirected to the dashboard
- [ ] Check that your avatar appears in the top-right
- [ ] Verify you can see engineers from your domain

### 5. Verify Team Filtering

- [ ] Create a test trip
- [ ] Your name should be pre-selected
- [ ] Engineer dropdown should only show your team (same email domain)
- [ ] Sign out and sign back in to verify session persistence

## 🎯 Current Configuration Summary

### Your Production URL
```
https://travelbook-orcin.vercel.app
```

### Required Google OAuth Redirect URI
```
https://travelbook-orcin.vercel.app/api/auth/callback/google
```

### Required Google OAuth Origin
```
https://travelbook-orcin.vercel.app
```

## 🔍 Verification Commands

Check if your OAuth client is configured correctly:

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth client
4. Verify you see both:
   - `http://localhost:3001/api/auth/callback/google` (for local)
   - `https://travelbook-orcin.vercel.app/api/auth/callback/google` (for production)

## 🚨 Common Issues

### Issue: "Redirect URI mismatch"
**Solution**: 
- Double-check the redirect URI in Google Cloud Console
- Make sure there are no trailing slashes
- Wait 5-10 minutes after saving changes

### Issue: "NEXTAUTH_SECRET is not set"
**Solution**:
- Verify environment variables are saved in Vercel
- Make sure you selected "Production" environment
- Redeploy after adding variables

### Issue: "Invalid client ID"
**Solution**:
- Check that `GOOGLE_CLIENT_ID` matches your OAuth client
- Verify no extra spaces or characters
- Make sure the variable is set for Production environment

### Issue: Works locally but not in production
**Solution**:
- Verify `NEXTAUTH_URL` is set to your production URL (not localhost)
- Check Vercel deployment logs for errors
- Ensure all 4 environment variables are set in Vercel

## 📊 Environment Variable Summary

Your configuration should look like this:

**Local (`.env.local` file)**
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=abc123...xyz
GOOGLE_CLIENT_ID=123456...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...xyz
```

**Production (Vercel Dashboard)**
```
NEXTAUTH_URL → https://travelbook-orcin.vercel.app
NEXTAUTH_SECRET → abc123...xyz (same as local)
GOOGLE_CLIENT_ID → 123456...xyz.apps.googleusercontent.com (same as local)
GOOGLE_CLIENT_SECRET → GOCSPX-abc123...xyz (same as local)
```

## ✅ Success Criteria

You'll know it's working when:
- ✅ Production site redirects to `/login` when not authenticated
- ✅ Google sign-in button works without errors
- ✅ OAuth flow completes and redirects back to dashboard
- ✅ Your profile picture and name appear in the navigation
- ✅ Only team members from your domain are visible
- ✅ Creating trips defaults to your name

## 🎉 Done!

Once all checkboxes are marked, your production authentication is complete!

If you encounter issues, see the full troubleshooting guide in `AUTH_SETUP.md`.

---

**Need help?** Check the [NextAuth.js documentation](https://authjs.dev/getting-started/deployment) for deployment best practices.

