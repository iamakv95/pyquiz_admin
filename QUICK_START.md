# 🚀 Quick Start Guide

Get your PyQuiz Admin app from code to live in 15 minutes!

## What You Need

- [ ] Node.js installed (version 20+)
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Supabase project with credentials

## Step-by-Step

### 1️⃣ Install Dependencies (2 minutes)

```bash
cd pyq-admin
npm install
```

Wait for installation to complete.

### 2️⃣ Set Up Environment (1 minute)

Create `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=development
```

Get these from Supabase Dashboard → Settings → API

### 3️⃣ Test Locally (2 minutes)

```bash
npm run dev
```

Open http://localhost:5173 and verify:
- [ ] App loads
- [ ] Can login
- [ ] Data displays

Press `Ctrl+C` to stop.

### 4️⃣ Push to GitHub (3 minutes)

**Easy way (GitHub Desktop):**
- See [SETUP_GIT.md](./SETUP_GIT.md) - Option 1

**Command line:**
```bash
git init
git add .
git commit -m "Initial commit"
```

Create repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/pyquiz-admin.git
git branch -M main
git push -u origin main
```

### 5️⃣ Deploy to Vercel (5 minutes)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Add environment variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   VITE_APP_ENV = production
   ```
6. Click "Deploy"

### 6️⃣ Test Live App (2 minutes)

Visit your Vercel URL (e.g., `https://pyquiz-admin.vercel.app`)

Test:
- [ ] Login works
- [ ] Data loads
- [ ] No errors in console

## 🎉 Done!

Your app is live! Share the URL with your team.

## 📚 Detailed Guides

Need more help? Check these:

- **Git Setup:** [SETUP_GIT.md](./SETUP_GIT.md)
- **Vercel Deployment:** [VERCEL_QUICK_DEPLOY.md](./VERCEL_QUICK_DEPLOY.md)
- **Full Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🔄 Making Updates

After initial deployment, updates are automatic:

```bash
# Make your changes, then:
git add .
git commit -m "Updated feature X"
git push
```

Vercel automatically deploys! ✨

## 🆘 Problems?

### Build Fails
```bash
npm run build
```
Fix any errors shown, then push again.

### Can't Login
- Check Supabase credentials in Vercel
- Verify environment variables are correct
- Redeploy after fixing

### Need Help?
- Check the detailed guides above
- Vercel Support: https://vercel.com/support
- Supabase Docs: https://supabase.com/docs

## 📁 Project Structure

```
pyq-admin/
├── src/              # Your code
├── public/           # Static files
├── .env.local        # Local environment (create this)
├── .env.example      # Example environment
├── package.json      # Dependencies
├── vercel.json       # Vercel config
└── README.md         # Project info
```

## ⚡ Commands Reference

```bash
npm install          # Install dependencies
npm run dev          # Start development
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run format       # Format code
```

## 🎯 Next Steps

1. Customize the app for your needs
2. Add more admins in Supabase
3. Set up staging environment (optional)
4. Configure custom domain (optional)

Happy coding! 🚀
