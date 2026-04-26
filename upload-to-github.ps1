# GitHub Upload Script for client-github
# Usage: .\upload-to-github.ps1

param(
    [string]$GitHubUsername = "",
    [string]$RepositoryName = "speedcopy-client",
    [switch]$SkipPush = $false
)

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
Write-Host "║     GitHub Upload Script - client-github                  ║" -ForegroundColor $Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan
Write-Host ""

# Get GitHub username if not provided
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

$RepoUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"

Write-Host "📋 Configuration:" -ForegroundColor $Cyan
Write-Host "   Username: $GitHubUsername"
Write-Host "   Repository: $RepositoryName"
Write-Host "   URL: $RepoUrl"
Write-Host ""

# Confirm
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Cancelled" -ForegroundColor $Red
    exit
}

Write-Host ""
Write-Host "🚀 Starting GitHub upload in batches..." -ForegroundColor $Green
Write-Host ""

# Initialize git
Write-Host "📦 Initializing git repository..." -ForegroundColor $Yellow
git init
git config user.name "SpeedCopy Developer"
git config user.email "dev@speedcopy.com"
git remote add origin $RepoUrl
Write-Host "✅ Git initialized" -ForegroundColor $Green
Write-Host ""

# Batch 1: Configuration Files
Write-Host "📦 Batch 1: Configuration files (10 files)..." -ForegroundColor $Yellow
git add package.json
git add package-lock.json
git add tsconfig.json
git add tsconfig.app.json
git add tsconfig.node.json
git add vite.config.ts
git add tailwind.config.js
git add postcss.config.js
git add eslint.config.js
git add .gitignore
git commit -m "chore: Add project configuration files"
if (-not $SkipPush) {
    git push -u origin main
}
Write-Host "✅ Batch 1 complete" -ForegroundColor $Green
Write-Host ""

# Batch 2: Services
Write-Host "📦 Batch 2: Service modules (17 files)..." -ForegroundColor $Yellow
git add src/services/
git commit -m "feat: Add all service modules

- shopping.service.ts (NEW - synced from client)
- product.service.ts
- order.service.ts
- payment.service.ts
- wallet.service.ts
- finance.service.ts
- auth.service.ts
- design.service.ts
- gifting.service.ts
- printing.service.ts
- notification.service.ts
- user.service.ts
- business-printing.service.ts
- flash-sale.service.ts
- ticket.service.ts
- wishlist.service.ts
- api.service.ts"
if (-not $SkipPush) {
    git push origin main
}
Write-Host "✅ Batch 2 complete" -ForegroundColor $Green
Write-Host ""

# Batch 3: Components
Write-Host "📦 Batch 3: React components (21 files)..." -ForegroundColor $Yellow
git add src/components/
git commit -m "feat: Add React components

- RazorpayTest.tsx (NEW - synced)
- WalletAPIDemo.tsx (NEW - synced)
- EnvTest.tsx (NEW - synced)
- Navbar, Footer, LoginModal
- AddressCard, AddressModal
- CategorySection, ContactSalesModal
- FindCenterModal, GetQuoteModal
- HeroSection, MarqueeBanner
- PrintTypeModal, PromoBanners
- ReferralBanner, Sidebar
- StatsSection, TestimonialsSection
- TopLoadingBar"
if (-not $SkipPush) {
    git push origin main
}
Write-Host "✅ Batch 3 complete" -ForegroundColor $Green
Write-Host ""

# Batch 4: Pages
Write-Host "📦 Batch 4: Page components (30 files)..." -ForegroundColor $Yellow
git add src/pages/
git commit -m "feat: Add page components

- CartPage.tsx (FIXED - getShoppingProducts)
- ProductListPage.tsx, ShoppingPage.tsx
- GiftingPage.tsx, HomePage.tsx
- DesignEditorPage.tsx, CheckoutPage.tsx
- GiftingCheckoutPage.tsx, PrintCheckoutPage.tsx
- OrdersPage.tsx, WalletPage.tsx
- ProfilePage.tsx, AddressPage.tsx
- AddFundsPage.tsx, PaymentSuccessPage.tsx
- OrderDetailPage.tsx, OrderTrackingFAQPage.tsx
- PaymentsFAQPage.tsx, TechnicalSupportFAQPage.tsx
- RaiseTicketPage.tsx, NotificationsPage.tsx
- WishlistPage.tsx, ReferPage.tsx
- ContactPage.tsx, ContactSalesPage.tsx
- HelpPage.tsx, PickupLocationPage.tsx
- PrintingPage.tsx, PrintConfigPage.tsx
- SimpleDesignEditorPage.tsx"
if (-not $SkipPush) {
    git push origin main
}
Write-Host "✅ Batch 4 complete" -ForegroundColor $Green
Write-Host ""

# Batch 5: Config, Hooks, Utils
Write-Host "📦 Batch 5: Config, hooks, utilities (9 files)..." -ForegroundColor $Yellow
git add src/config/
git add src/hooks/
git add src/utils/
git add src/context/
git add src/assets/
git add src/App.tsx
git add src/main.tsx
git add src/index.css
git add src/App.css
git commit -m "feat: Add config, hooks, utilities and assets

- Firebase configuration
- Auth context
- Custom hooks (useAsync)
- Utility functions
- CSS files
- Asset images"
if (-not $SkipPush) {
    git push origin main
}
Write-Host "✅ Batch 5 complete" -ForegroundColor $Green
Write-Host ""

# Batch 6: Public & Documentation
Write-Host "📦 Batch 6: Public assets and documentation (8 files)..." -ForegroundColor $Yellow
git add public/
git add README.md
git add .env.example
git add GITHUB_UPLOAD_GUIDE.md
git add BUILD_AND_DEPLOY.md
git add GITHUB_UPLOAD_STEPS.md
git add CLIENT_GITHUB_SYNC_STATUS.md
git commit -m "docs: Add public assets and documentation

- Public folder with icons and favicon
- Environment example file
- Upload and deployment guides
- Sync status documentation"
if (-not $SkipPush) {
    git push origin main
}
Write-Host "✅ Batch 6 complete" -ForegroundColor $Green
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║                    ✅ UPLOAD COMPLETE!                    ║" -ForegroundColor $Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor $Cyan
Write-Host "   Total Commits: 6"
Write-Host "   Total Files: ~95"
Write-Host "   Repository: $RepoUrl"
Write-Host ""

Write-Host "🔗 View on GitHub:" -ForegroundColor $Cyan
Write-Host "   https://github.com/$GitHubUsername/$RepositoryName"
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor $Cyan
Write-Host "   1. Add comprehensive README.md"
Write-Host "   2. Create GitHub Actions CI/CD"
Write-Host "   3. Set up branch protection rules"
Write-Host "   4. Deploy to Vercel/Netlify"
Write-Host "   5. Fix remaining TypeScript errors in PRs"
Write-Host ""

Write-Host "✨ Happy coding!" -ForegroundColor $Green
