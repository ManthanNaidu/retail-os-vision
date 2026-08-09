#!/usr/bin/env pwsh
# RetailOS AI — GitHub Push Script
# Run this in PowerShell to push your code to GitHub

Write-Host "RetailOS AI — GitHub Push Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check git status
Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Step 2: Stage all changes..." -ForegroundColor Yellow
git add -A

Write-Host ""
Write-Host "Step 3: Creating commit..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "RetailOS AI — Production Update $timestamp

New in this release:
- Fixed InvoiceScanner: multi-model Gemini fallback (1.5-flash, 2.0-flash, 1.5-pro)
- Added Manual Entry mode for invoice products
- Login: supports OTP + Password login modes
- Store Setup Wizard: 8 store types (Medical, Grocery, Electronics, Clothing, etc)
- Master Dashboard: Business Health Score, KPI cards, alerts, charts
- Dynamic categories by store type in inventory
- Auth protection on all dashboard routes
- Sidebar: real store name/type from profile, logout button
- Settings: editable store profile, password management, data export
- Fixed all TypeScript errors - zero build errors"

Write-Host ""

# Step 4: Check if remote exists
$remote = git remote -v 2>&1
if ($remote -match "origin") {
    Write-Host "Step 4: Remote 'origin' found. Pushing..." -ForegroundColor Yellow
    git push origin master
    Write-Host ""
    Write-Host "DONE! Code pushed to GitHub successfully." -ForegroundColor Green
} else {
    Write-Host "Step 4: No remote found. Please add your GitHub remote:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option A — Create new GitHub repo and push:" -ForegroundColor White
    Write-Host "  1. Go to github.com → New repository" -ForegroundColor Gray
    Write-Host "  2. Name it: retailos-ai" -ForegroundColor Gray
    Write-Host "  3. Copy the repo URL (e.g. https://github.com/yourname/retailos-ai.git)" -ForegroundColor Gray
    Write-Host "  4. Run this command:" -ForegroundColor Gray
    Write-Host "     git remote add origin https://github.com/yourname/retailos-ai.git" -ForegroundColor Cyan
    Write-Host "     git push -u origin master" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option B — Use GitHub CLI (easiest):" -ForegroundColor White
    Write-Host "  gh repo create retailos-ai --public --push --source=." -ForegroundColor Cyan
}
