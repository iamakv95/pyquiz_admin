# Quick Vercel Deployment Guide

Simple guide to deploy PyQuiz Admin Web App to Vercel with default Vercel domain.

## Prerequisites

- GitHub/GitLab/Bitbucket account with your code pushed
- Vercel account (free tier works fine)
- Supabase project with credentials

## Step 1: Push Code to Git

Make sure your code is pushed to GitHub (or GitLab/Bitbucket):

```bash
cd pyquiz-admin-web
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with your GitHub/GitLab/Bitbucket account
4. Authorize Vercel to access your repositories

## Step 3: Import Your Project

1. Click "Add New..." → "Project"
2. Find your repository in the list
3. Click "Import"

## Step 4: Configure Project

### Root Directory
- If your repo has multiple folders, set **Root Directory** to: `pyquiz-admin-web`
- If `pyquiz-admin-web` is your repo root, leave it blank

### Framework Preset
- Vercel should auto-detect "Vite"
- If not, select "Vite" from the dropdown

### Build Settings
These should be auto-filled, but verify:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## Step 5: Add Environment Variables

Click "Environment Variables" and add these:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
VITE_APP_ENV = production
VITE_APP_NAME = PyQuiz Admin
```

**Where to find Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy "Project URL" → paste as `VITE_SUPABASE_URL`
4. Copy "anon public" key → paste as `VITE_SUPABASE_ANON_KEY`

**Important:** Make sure to add these for "Production" environment!

## Step 6: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. You'll see "Congratulations!" when done

## Step 7: Access Your App

Your app will be available at:
```
https://your-project-name.vercel.app
```

Or:
```
https://your-project-name-your-username.vercel.app
```

Click "Visit" or "Go to Dashboard" to see your deployment.

## Step 8: Test Your Deployment

1. Visit your Vercel URL
2. Try to log in with your admin credentials
3. Check that data loads correctly
4. Verify images and charts work

## Common Issues & Solutions

### Issue: Build fails with "Command failed"

**Solution:** Check the build logs. Usually it's:
- Missing environment variables
- TypeScript errors
- Missing dependencies

Fix locally first:
```bash
npm run build
```

### Issue: App loads but shows errors

**Solution:** Check environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all variables are set correctly
3. Redeploy: Deployments → Click "..." → "Redeploy"

### Issue: "VITE_SUPABASE_URL is not defined"

**Solution:** 
1. Environment variables must start with `VITE_`
2. After adding/changing env vars, you must redeploy
3. Go to Deployments → Latest deployment → "..." → "Redeploy"

### Issue: Routes return 404

**Solution:** This shouldn't happen with our `vercel.json` config, but if it does:
1. Check that `vercel.json` exists in your project root
2. Verify it has the rewrite rules for SPA routing
3. Redeploy

## Updating Your App

Every time you push to your main branch, Vercel automatically deploys:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your app
3. Deploy automatically
4. Send you an email when done

## Viewing Deployment Logs

If something goes wrong:

1. Go to Vercel Dashboard
2. Click your project
3. Click "Deployments"
4. Click the failed deployment
5. Click "Building" to see build logs
6. Look for error messages in red

## Environment Variables Reference

Here's what each variable does:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGc...` |
| `VITE_APP_ENV` | Yes | Environment name | `production` |
| `VITE_APP_NAME` | No | App display name | `PyQuiz Admin` |
| `VITE_ENABLE_ANALYTICS` | No | Enable analytics | `true` or `false` |

## Staging Environment (Optional)

Want a staging environment? Easy:

1. Create a `staging` branch:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. In Vercel Dashboard → Settings → Git:
   - Enable "Production Branch": `main`
   - Staging will auto-deploy from `staging` branch

3. Add staging environment variables:
   - Go to Settings → Environment Variables
   - Select "Preview" environment
   - Add your staging Supabase credentials

Now you have:
- **Production:** `main` branch → `your-project.vercel.app`
- **Staging:** `staging` branch → `your-project-git-staging.vercel.app`

## Getting Help

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Build Logs:** Check in Vercel Dashboard → Deployments

## Quick Commands

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from command line
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## That's It!

Your app is now live on Vercel with automatic deployments. Every push to `main` will trigger a new deployment.

**Your Vercel URL:** `https://your-project-name.vercel.app`

Share this URL with your team to access the admin panel!
