$ErrorActionPreference = "Stop"

Write-Host "Creating new directories..."
New-Item -ItemType Directory -Force -Path "src/components/features"
New-Item -ItemType Directory -Force -Path "src/app/(auth)"
New-Item -ItemType Directory -Force -Path "src/components/features/setup"

Write-Host "Moving component directories..."
Move-Item -Path "src/components/billing" -Destination "src/components/features/billing" -Force
Move-Item -Path "src/components/dashboard" -Destination "src/components/features/dashboard" -Force
Move-Item -Path "src/components/settings" -Destination "src/components/features/settings" -Force
Move-Item -Path "src/components/shared" -Destination "src/components/ui" -Force

Write-Host "Moving auth routes..."
Move-Item -Path "src/app/login" -Destination "src/app/(auth)/login" -Force
Move-Item -Path "src/app/register" -Destination "src/app/(auth)/register" -Force
Move-Item -Path "src/app/forgot-password" -Destination "src/app/(auth)/forgot-password" -Force

Write-Host "Moving setup component..."
Move-Item -Path "src/app/setup/WelcomeScreen.tsx" -Destination "src/components/features/setup/WelcomeScreen.tsx" -Force

Write-Host "Updating import paths in all files..."
$files = Get-ChildItem -Path "src" -Include *.ts, *.tsx -Recurse -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Use exact regex matching for imports to avoid partial matching issues
    $newContent = $content -replace '@/components/billing/', '@/components/features/billing/' `
                           -replace '@/components/dashboard/', '@/components/features/dashboard/' `
                           -replace '@/components/settings/', '@/components/features/settings/' `
                           -replace '@/components/shared/', '@/components/ui/' `
                           -replace 'from ''\./WelcomeScreen''', 'from ''@/components/features/setup/WelcomeScreen''' `
                           -replace 'from "\./WelcomeScreen"', 'from "@/components/features/setup/WelcomeScreen"'
                           
    if ($content -ne $newContent) {
        Write-Host "Updated imports in: $($file.FullName)"
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
    }
}

Write-Host "Refactoring complete."
