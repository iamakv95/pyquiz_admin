# Git Setup Guide

Quick guide to set up Git and push to GitHub.

## Option 1: Using GitHub Desktop (Easiest)

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select the `pyq-admin` folder
5. Click "Publish repository"
6. Choose repository name (e.g., `pyquiz-admin`)
7. Click "Publish repository"

Done! Your code is now on GitHub.

## Option 2: Using Command Line

### Step 1: Initialize Git

Open terminal in `pyq-admin` folder:

```bash
git init
```

### Step 2: Add Files

```bash
git add .
```

### Step 3: Commit

```bash
git commit -m "Initial commit - PyQuiz Admin"
```

### Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `pyquiz-admin` (or your choice)
3. Description: "Admin panel for PyQuiz"
4. Choose Private or Public
5. **Don't** check "Initialize with README"
6. Click "Create repository"

### Step 5: Connect to GitHub

Copy the commands from GitHub (they look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/pyquiz-admin.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 6: Push Code

```bash
git push -u origin main
```

Enter your GitHub credentials if asked.

## Verify

Go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/pyquiz-admin
```

You should see all your files!

## Next Steps

Now you can deploy to Vercel:
1. See [VERCEL_QUICK_DEPLOY.md](./VERCEL_QUICK_DEPLOY.md)
2. Or follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Common Issues

### "git: command not found"

Install Git:
- Windows: https://git-scm.com/download/win
- Mac: `brew install git` or download from https://git-scm.com
- Linux: `sudo apt install git`

### Authentication Failed

Use GitHub Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token
5. Use token as password when pushing

Or use GitHub CLI:
```bash
gh auth login
```

### Already Exists Error

If you get "repository already exists":

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/NEW_REPO_NAME.git
git push -u origin main
```

## Future Updates

After initial setup, to push changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

That's it! Simple as that.
