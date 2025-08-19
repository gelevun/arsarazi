#!/bin/bash

echo ""
echo "========================================"
echo "   ARSARAZI - GITHUB COMMIT SCRIPT"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git bulunamadı! Lütfen Git yükleyin."
    echo "   Download: https://git-scm.com/"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Git repository başlatılıyor..."
    git init
    
    echo "🔗 Remote repository ekleniyor..."
    git remote add origin https://github.com/gelevun/arsarazi.git
    
    echo "✅ Git repository hazır!"
    echo ""
fi

# Check git status
echo "📊 Git durumu kontrol ediliyor..."
if ! git status --porcelain &> /dev/null; then
    echo "❌ Git durumu kontrol edilemiyor!"
    exit 1
fi

echo ""
echo "📝 Commit mesajını girin (Enter ile varsayılan mesaj):"
read -p "Commit mesajı: " commit_message

if [ -z "$commit_message" ]; then
    commit_message="feat: Arsarazi website initial implementation with backend API"
fi

echo ""
echo "🔄 Dosyalar Git'e ekleniyor..."
git add .

echo "📤 Commit oluşturuluyor..."
if ! git commit -m "$commit_message"; then
    echo "❌ Commit oluşturulamadı!"
    echo "Değişiklik yoksa commit yapılamaz."
    exit 1
fi

echo "🌐 GitHub'a push ediliyor..."
if ! git push -u origin main; then
    echo "❌ Push başarısız!"
    echo ""
    echo "🔧 Çözüm önerileri:"
    echo "   1. GitHub authentication kontrol edin"
    echo "   2. Repository URL'i doğru mu: https://github.com/gelevun/arsarazi.git"
    echo "   3. Git credentials yapılandırın"
    echo ""
    echo "💡 Manuel push için:"
    echo "   git remote set-url origin https://github.com/gelevun/arsarazi.git"
    echo "   git push -u origin main"
    exit 1
fi

echo ""
echo "========================================"
echo "           ✅ BAŞARIYLA TAMAMLANDI!"
echo "========================================"
echo ""
echo "🎉 Kodlar GitHub'a yüklendi!"
echo "🌐 Repository: https://github.com/gelevun/arsarazi"
echo "📊 Actions: https://github.com/gelevun/arsarazi/actions"
echo ""
echo "🔄 CI/CD Pipeline otomatik olarak başlayacak:"
echo "   ✓ Code quality check"
echo "   ✓ Database migration test"
echo "   ✓ API endpoint testing"
echo "   ✓ Build artifacts creation"
echo ""