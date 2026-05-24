@echo off
cd /d "%~dp0.."
if not exist ".env.local" (
  echo .env.local yok. Ornek:
  echo BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
  echo.
  echo Veya CMD: set BLOB_READ_WRITE_TOKEN=tokenin
  exit /b 1
)
for /f "usebackq tokens=1,* delims==" %%A in (".env.local") do (
  if "%%A"=="BLOB_READ_WRITE_TOKEN" set "BLOB_READ_WRITE_TOKEN=%%B"
)
if "%BLOB_READ_WRITE_TOKEN%"=="" (
  echo .env.local icinde BLOB_READ_WRITE_TOKEN=... satiri ekle
  exit /b 1
)
call npm run upload-blob
