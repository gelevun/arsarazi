@echo off
title Arsarazi - Tam Kurulum

echo.
echo ================================================
echo    ARSARAZI - TAM OTOMATIK KURULUM
echo ================================================
echo.
echo Bu script tamamen otomatik olarak:
echo ✅ Gerekli modulleri yukleyecek
echo ✅ Veritabani kuracak  
echo ✅ Ornek verileri ekleyecek
echo ✅ Server'i baslatok
echo.
echo Hicbir sey yapmaniz gerekmiyor! ⏳
echo.
pause

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadi!
    echo.
    echo 📥 Node.js yuklemek icin:
    echo    1. https://nodejs.org adresine gidin
    echo    2. LTS surusunu indirin
    echo    3. Kurulum yapip bu script'i tekrar calistirin
    echo.
    pause
    exit /b 1
)

echo 📦 Node.js bulundu: 
node --version

echo.
echo 📦 Gerekli moduller yukleniyor...
npm install
if %errorlevel% neq 0 (
    echo ❌ Modul yukleme basarisiz!
    echo.
    echo 🔧 Cozum onerileri:
    echo    1. Internet baglantinizi kontrol edin
    echo    2. Antivirus engellemesi var mi kontrol edin
    echo    3. Admin yetkisiyle calistirin
    echo.
    pause
    exit /b 1
)

echo ✅ Moduller yuklendi!

echo.
echo 🗄️ Veritabani kuruluyor...
node setup-database.js
if %errorlevel% neq 0 (
    echo ❌ Veritabani kurulumu basarisiz!
    pause
    exit /b 1
)

echo.
echo 🔧 Son ayarlar yapiliyor...

REM Create data directory if not exists
if not exist data mkdir data

REM Create uploads directory if not exists  
if not exist uploads mkdir uploads

REM Create backups directory if not exists
if not exist backups mkdir backups

echo.
echo ================================================
echo        ✅ KURULUM BASARIYLA TAMAMLANDI!
echo ================================================
echo.
echo 🎉 Arsarazi sisteminiz tamamen hazir!
echo.
echo 🚀 Server baslatiluyor...
echo.

REM Start the server
node server-sqlite.js

echo.
echo Server kapandi. Tekrar baslatmak icin:
echo   Windows: start.bat  
echo   Manuel: npm start
echo.
pause