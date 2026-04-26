# GitHub Repository Setup

## Initial Setup

### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/yourusername/speedcopy-client.git

# Create main branch
git branch -M main

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: SpeedCopy client setup"

# Push to GitHub
git push -u origin main
```

### 2. Configure GitHub Secrets

For CI/CD workflows to work, add these secrets:

1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

```
VITE_API_URL=https://api.speedcopy.com
VITE_RAZORPAY_KEY_ID=your_production_key
VITE_TWILIO_VERIFY_SERVICE_SID=your_production_sid
```

### 3. Enable GitHub Pages (Optional)

For GitHub Pages deployment:

1. Go to: Settings → Pages
2. Select "Deploy from a branch"
3. Choose branch: `gh-pages`
4. Save

### 4. Configure Branch Protection (Optional)

For production safety:

1. Go to: Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require status checks to pass
   - Require code reviews
   - Dismiss stale reviews

## Automated Workflows

### Deploy Workflow
- **Trigger**: Push to `main` branch
- **Action**: Builds and deploys to GitHub Pages
- **File**: `.github/workflows/deploy.yml`

### Lint Workflow
- **Trigger**: Push to `main` or `develop`, PR to `main` or `develop`
- **Action**: Runs ESLint to check code quality
- **File**: `.github/workflows/lint.yml`

## Deployment Platforms

### Option 1: GitHub Pages (Free)

Already configured in workflows. Just enable in Settings → Pages.

### Option 2: Vercel (Recommended)

1. Go to vercel.com
2. Click "New Project"
3. Import from GitHub
4. Select this repository
5. Add environment variables
6. Deploy

### Option 3: Netlify

1. Go to netlify.com
2. Click "New site from Git"
3. Select GitHub
4. Choose this repository
5. Configure build settings
6. Deploy

## File Size

- **Total**: ~21 MB (mostly images in public folder)
- **Source code**: ~1 MB
- **No node_modules**: Keeps repo lightweight

## Gitignore

Already configured to exclude:
- node_modules/
- dist/
- .env (use .env.example)
- .vite/
- Logs

## Continuous Integration

### Before Pushing

```bash
# Run linter
npm run lint

# Build locally
npm run build

# Test build
npm run preview
```

### After Pushing

1. GitHub Actions automatically runs workflows
2. Check Actions tab for status
3. Fix any lint errors
4. Deployment happens automatically on success

## Troubleshooting

### Workflow Fails

1. Check Actions tab for error logs
2. Verify secrets are set correctly
3. Ensure .env.example has all required variables
4. Check Node.js version compatibility

### Deployment Issues

1. Verify build succeeds locally: `npm run build`
2. Check environment variables in GitHub secrets
3. Review deployment platform logs
4. Ensure API endpoint is accessible

### Large File Issues

If you accidentally commit large files:

```bash
# Remove from git history
git rm --cached large-file
git commit --amend -m "Remove large file"
git push --force-with-lease
```

## Best Practices

1. ✅ Always run `npm run lint` before pushing
2. ✅ Test build locally: `npm run build`
3. ✅ Use meaningful commit messages
4. ✅ Create branches for features
5. ✅ Use pull requests for code review
6. ✅ Keep .env.example updated
7. ✅ Don't commit sensitive data

## Useful Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# Create feature branch
git checkout -b feature/your-feature

# Push branch
git push -u origin feature/your-feature

# Create pull request
# (Use GitHub UI)

# Merge and delete branch
git checkout main
git pull origin main
git branch -d feature/your-feature
```

## Support

- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
