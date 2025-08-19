@echo off
title Arsarazi Backend Server

echo.
echo ========================================
echo    ARSARAZI BACKEND SERVER STARTER
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadi! Lutfen Node.js yukleyin.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist package.json (
    echo ❌ package.json bulunamadi!
    echo    Bu dosyayi proje klasorunde calistirin.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Gerekli paketler yukleniyor...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Paket yukleme basarisiz!
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist .env (
    echo 📝 .env dosyasi olusturuluyor...
    copy .env.example .env
    echo ✅ .env dosyasi olusturuldu. Gerekirse duzenleyin.
)

echo 🚀 Server baslatiliyor...
echo.

REM Start the server with the smart port detection
node start-server.js

echo.
echo Server kapandi.
pause