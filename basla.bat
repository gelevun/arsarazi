@echo off
echo ========================================
echo     ARSARAZI BACKEND BASLATILIYOR
echo ========================================
echo.

:: Node.js kontrolü
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js kurulu degil!
    echo.
    echo Lutfen once Node.js kurun:
    echo 1. nodejs.org sitesine gidin
    echo 2. Windows Installer'i indirin
    echo 3. Kurun ve tekrar deneyin
    echo.
    pause
    exit
)

echo [OK] Node.js kurulu
echo.

:: Hangi backend dosyası var kontrol et
if exist "backend-basit.js" (
    echo [OK] backend-basit.js bulundu
    echo.
    echo Backend baslatiliyor...
    echo.
    node backend-basit.js
) else if exist "server.js" (
    echo [OK] server.js bulundu
    echo.
    echo Server baslatiliyor...
    echo.
    node server.js
) else if exist "server-basit.js" (
    echo [OK] server-basit.js bulundu
    echo.
    echo Server baslatiliyor...
    echo.
    node server-basit.js
) else (
    echo [HATA] Backend dosyasi bulunamadi!
    echo.
    echo Lutfen su dosyalardan birinin oldugunduguna emin olun:
    echo - backend-basit.js
    echo - server.js
    echo - server-basit.js
    echo.
    pause
)