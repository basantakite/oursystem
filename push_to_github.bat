@echo off
chcp 65001 >nul
echo ========================================================================
echo 🚀 HELAMBU ELECTION SYSTEM — 1-CLICK PUSH TO github.com/globalgemss/vrm
echo ========================================================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository and linking to https://github.com/globalgemss/vrm.git ...
    git init
    git branch -M main
    git remote add origin https://github.com/globalgemss/vrm.git
) else (
    git remote set-url origin https://github.com/globalgemss/vrm.git
)

echo [1/3] Staging all updated React, Vercel & Supabase files...
git add .

echo [2/3] Creating commit...
git commit -m "feat: upgrade Official Voter Roll UI/UX, Bulk CSV Import Studio & Sample Preview"

echo [3/3] Pushing to https://github.com/globalgemss/vrm.git (Vercel will auto-deploy)...
git push -u origin main

echo.
echo ========================================================================
echo ✅ Done! Your changes are pushed to https://github.com/globalgemss/vrm
echo ========================================================================
pause
