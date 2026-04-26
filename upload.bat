@echo off
REM GitHub Upload Script for client-github
REM Usage: upload.bat YOUR_USERNAME

if "%1"=="" (
    echo Usage: upload.bat YOUR_GITHUB_USERNAME
    echo Example: upload.bat john-doe
    pause
    exit /b 1
)

set USERNAME=%1
set REPO=speedcopy-client
set URL=https://github.com/%USERNAME%/%REPO%.git

echo.
echo ========================================
echo GitHub Upload - client-github
echo ========================================
echo Username: %USERNAME%
echo Repository: %REPO%
echo URL: %URL%
echo.

REM Initialize git
echo [1/6] Initializing git...
git init
git config user.name "SpeedCopy Developer"
git config user.email "dev@speedcopy.com"
git remote add origin %URL%
echo Done!
echo.

REM Batch 1: Config files
echo [2/6] Uploading config files...
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js eslint.config.js .gitignore .env.example
git commit -m "chore: add config files"
git push -u origin main
echo Done!
echo.

REM Batch 2: Services
echo [3/6] Uploading services...
git add src/services/
git commit -m "feat: add services"
git push
echo Done!
echo.

REM Batch 3: Components
echo [4/6] Uploading components...
git add src/components/
git commit -m "feat: add components"
git push
echo Done!
echo.

REM Batch 4: Pages
echo [5/6] Uploading pages...
git add src/pages/
git commit -m "feat: add pages"
git push
echo Done!
echo.

REM Batch 5: Config and Utils
echo [6/6] Uploading config and utilities...
git add src/config/ src/hooks/ src/utils/ src/context/ src/assets/ src/App.tsx src/main.tsx src/index.css src/App.css
git commit -m "feat: add config and utilities"
git push
echo Done!
echo.

REM Batch 6: Public
echo [7/7] Uploading public assets...
git add public/
git commit -m "docs: add public assets"
git push
echo Done!
echo.

echo ========================================
echo Upload Complete!
echo ========================================
echo Repository: https://github.com/%USERNAME%/%REPO%
echo.
pause
