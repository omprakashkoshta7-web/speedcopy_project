# Deployment Guide

This guide covers deploying the SpeedCopy client to various platforms.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Local Setup

```bash
# Clone repository
git clone https://github.com/yourusername/speedcopy-client.git
cd speedcopy-client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values
# VITE_API_URL=your_api_url
# VITE_RAZORPAY_KEY_ID=your_key
# VITE_TWILIO_VERIFY_SERVICE_SID=your_sid

# Start development server
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is optimized for Vite and provides automatic deployments.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Add from `.env.example`

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Or connect GitHub:**
1. Go to netlify.com
2. Click "New site from Git"
3. Select your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in Site settings

### 3. GitHub Pages

```bash
# Update vite.config.ts with your repo name
# base: '/your-repo-name/'

npm run build

# Deploy using gh-pages
npm install -g gh-pages
gh-pages -d dist
```

### 4. AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 5. Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t speedcopy-client .
docker run -p 80:80 speedcopy-client
```

## Environment Variables

Required for production:

```env
# API endpoint
VITE_API_URL=https://api.speedcopy.com

# Payment gateway
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx

# SMS verification
VITE_TWILIO_VERIFY_SERVICE_SID=VAxxxxx

# Analytics (optional)
VITE_ENABLE_ANALYTICS=true
```

## CI/CD Pipeline

GitHub Actions workflows are included:

- **deploy.yml** - Automatic deployment on push to main
- **lint.yml** - Code quality checks on PR

Workflows run automatically. Ensure secrets are configured in GitHub:
1. Go to Settings → Secrets and variables → Actions
2. Add required environment variables

## Performance Optimization

The build includes code splitting:
- `fabric.js` - Separate chunk for design editor
- `react-vendor` - React and routing libraries
- `icons` - Lucide React icons
- `vendor` - Other dependencies

This reduces initial bundle size and improves load times.

## Monitoring

After deployment:

1. Check build logs for errors
2. Test all features in production
3. Monitor performance metrics
4. Set up error tracking (Sentry, etc.)

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API connection issues
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure API is accessible from deployment region

### Large bundle size
```bash
# Analyze bundle
npm install -g vite-plugin-visualizer
# Check dist folder size
```

## Support

For deployment issues, check:
- Vite docs: https://vitejs.dev/guide/
- React docs: https://react.dev/
- Framework-specific docs (Vercel, Netlify, etc.)
