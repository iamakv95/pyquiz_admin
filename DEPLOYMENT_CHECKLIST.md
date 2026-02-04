# Deployment Checklist

Follow these steps to deploy your PyQuiz Admin app to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Ready
- [ ] Have Supabase project URL
- [ ] Have Supabase anon key
- [ ] Tested locally with these credentials

### 2. Code Ready
- [ ] All changes committed
- [ ] No console errors in development
- [ ] App runs locally: `npm run dev`
- [ ] Production build works: `npm run build`

### 3. Git Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible
- [ ] On correct branch (usually `main`)

## 🚀 Deployment Steps

### Step 1: Initialize Git (if not done)

```bash
cd pyq-admin
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `pyquiz-admin`)
3. Don't initialize with README (we already have one)

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/pyquiz-admin.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure:
   - Framework: Vite (auto-detected)
   - Root Directory: Leave blank (or set if needed)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 5: Add Environment Variables

In Vercel project settings, add:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
VITE_APP_ENV = production
VITE_APP_NAME = PyQuiz Admin
```

### Step 6: Deploy

Click "Deploy" and wait 2-3 minutes.

### Step 7: Test Deployment

- [ ] Visit your Vercel URL
- [ ] Login works
- [ ] Data loads correctly
- [ ] No console errors
- [ ] Images display properly
- [ ] All routes work

## 📋 Post-Deployment

### Verify Everything Works
- [ ] Authentication
- [ ] Question management
- [ ] Quiz management
- [ ] User management
- [ ] Analytics
- [ ] Image uploads

### Share Access
- [ ] Copy Vercel URL
- [ ] Share with team
- [ ] Document login credentials

### Monitor
- [ ] Check Vercel dashboard for errors
- [ ] Monitor performance
- [ ] Check user feedback

## 🔄 Future Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically deploy the changes!

## 🆘 Troubleshooting

### Build Fails
1. Check build logs in Vercel
2. Test locally: `npm run build`
3. Fix errors and push again

### Environment Variables Not Working
1. Verify they start with `VITE_`
2. Check spelling
3. Redeploy after adding/changing variables

### App Loads But Errors
1. Check browser console
2. Verify Supabase credentials
3. Check Network tab for failed requests

## 📞 Need Help?

- Check [VERCEL_QUICK_DEPLOY.md](./VERCEL_QUICK_DEPLOY.md)
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

## ✨ You're Done!

Your app is live at: `https://your-project.vercel.app`

Congratulations! 🎉
