# API + Vite (PowerShell — boşluklu klasör adı güvenli)
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Start-Process cmd -ArgumentList '/k', 'npm run server' -WorkingDirectory $Root -WindowStyle Normal
Start-Sleep -Milliseconds 800
Start-Process cmd -ArgumentList '/k', 'npm run dev' -WorkingDirectory $Root -WindowStyle Normal

Write-Host 'API   -> http://localhost:3001/api/health'
Write-Host 'Panel -> http://localhost:5173'
