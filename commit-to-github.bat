@echo off
title Arsarazi - GitHub Commit Script

echo.
echo ========================================
echo    ARSARAZI - GITHUB COMMIT SCRIPT
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git bulunamadi! Lutfen Git yukleyin.
    echo    Download: https://git-scm.com/
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist .git (
    echo 📁 Git repository baslatiliyor...
    git init
    
    echo 🔗 Remote repository ekleniyor...
    git remote add origin https://github.com/gelevun/arsarazi.git
    
    echo ✅ Git repository hazir!
    echo.
)

REM Check git status
echo 📊 Git durumu kontrol ediliyor...
git status --porcelain > nul
if %errorlevel% neq 0 (
    echo ❌ Git durumu kontrol edilemiyor!
    pause
    exit /b 1
)

echo.
echo 📝 Commit mesajini girin (Enter ile varsayilan mesaj):
set /p commit_message="Commit mesaji: "

if "%commit_message%"=="" (
    set commit_message=feat: Arsarazi website initial implementation with backend API
)

echo.
echo 🔄 Dosyalar Git'e ekleniyor...
git add .

echo 📤 Commit olusturuluyor...
git commit -m "%commit_message%"

if %errorlevel% neq 0 (
    echo ❌ Commit olusturulamadi!
    echo Degisiklik yoksa commit yapilamaz.
    pause
    exit /b 1
)

echo 🌐 GitHub'a push ediliyor...
git push -u origin main

if %errorlevel% neq 0 (
    echo ❌ Push basarisiz! 
    echo.
    echo 🔧 Cozum onerileri:
    echo    1. GitHub authentication kontrol edin
    echo    2. Repository URL'i dogru mu: https://github.com/gelevun/arsarazi.git  
    echo    3. Git credentials yapιlandιrιn
    echo.
    echo 💡 Manuel push icin:
    echo    git remote set-url origin https://github.com/gelevun/arsarazi.git
    echo    git push -u origin main
    pause
    exit /b 1
)

echo.
echo ========================================
echo           ✅ BAŞARIYLA TAMAMLANDI!
echo ========================================
echo.
echo 🎉 Kodlar GitHub'a yüklendi!
echo 🌐 Repository: https://github.com/gelevun/arsarazi
echo 📊 Actions: https://github.com/gelevun/arsarazi/actions
echo.
echo 🔄 CI/CD Pipeline otomatik olarak başlayacak:
echo    ✓ Code quality check
echo    ✓ Database migration test  
echo    ✓ API endpoint testing
echo    ✓ Build artifacts creation
echo.
pause