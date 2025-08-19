@echo off
chcp 65001 > nul
color 0A
title Arsarazi Backend Kurulum

echo.
echo ════════════════════════════════════════════════════════════
echo           ARSARAZI BACKEND OTOMATIK KURULUM
echo ════════════════════════════════════════════════════════════
echo.
echo Bu program backend'i otomatik kuracak.
echo.
pause

echo.
echo [1/5] Node.js kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js kurulu değil!
    echo.
    echo Lütfen önce Node.js kurun:
    echo 1. https://nodejs.org adresine gidin
    echo 2. LTS versiyonu indirin ve kurun
    echo 3. Bu programı tekrar çalıştırın
    echo.
    pause
    exit
)
echo ✅ Node.js kurulu

echo.
echo [2/5] package.json oluşturuluyor...
if not exist package.json (
    npm init -y >nul 2>&1
    echo ✅ package.json oluşturuldu
) else (
    echo ✅ package.json zaten mevcut
)

echo.
echo [3/5] Gerekli paketler yükleniyor...
echo ⏳ Bu biraz zaman alabilir, lütfen bekleyin...
npm install express cors dotenv >nul 2>&1
echo ✅ Express, CORS, Dotenv yüklendi

echo.
echo [4/5] Veritabanı paketi yükleniyor...
npm install sqlite3 >nul 2>&1
echo ✅ SQLite3 yüklendi

echo.
echo [5/5] Backend başlatılıyor...
echo.
echo ════════════════════════════════════════════════════════════
echo           ✅ KURULUM TAMAMLANDI!
echo ════════════════════════════════════════════════════════════
echo.
echo Backend'i başlatmak için:
echo.
echo    node server-basit.js
echo.
echo yazın ve Enter'a basın.
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo Backend'i şimdi başlatmak ister misiniz? (E/H)
set /p cevap=

if /i "%cevap%"=="E" (
    echo.
    echo Backend başlatılıyor...
    echo.
    node server-basit.js
) else (
    echo.
    echo İstediğiniz zaman başlatabilirsiniz: node server-basit.js
    echo.
    pause
)