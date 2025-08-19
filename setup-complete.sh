#!/bin/bash

echo ""
echo "================================================"
echo "    ARSARAZI - TAM OTOMATIK KURULUM"
echo "================================================"
echo ""
echo "Bu script tamamen otomatik olarak:"
echo "✅ Gerekli modülleri yükleyecek"
echo "✅ Veritabanı kuracak"
echo "✅ Örnek verileri ekleyecek"
echo "✅ Server'ı başlatacak"
echo ""
echo "Hiçbir şey yapmanız gerekmiyor! ⏳"
echo ""
read -p "Devam etmek için Enter tuşuna basın..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    echo ""
    echo "📥 Node.js yüklemek için:"
    echo "   macOS: brew install node"
    echo "   Ubuntu: sudo apt install nodejs npm"
    echo "   veya https://nodejs.org adresinden indirin"
    echo ""
    exit 1
fi

echo "📦 Node.js bulundu: $(node --version)"

echo ""
echo "📦 Gerekli modüller yükleniyor..."
if ! npm install; then
    echo "❌ Modül yükleme başarısız!"
    echo ""
    echo "🔧 Çözüm önerileri:"
    echo "   1. İnternet bağlantınızı kontrol edin"
    echo "   2. npm cache clean --force"
    echo "   3. rm -rf node_modules && npm install"
    echo ""
    exit 1
fi

echo "✅ Modüller yüklendi!"

echo ""
echo "🗄️ Veritabanı kuruluyor..."
if ! node setup-database.js; then
    echo "❌ Veritabanı kurulumu başarısız!"
    exit 1
fi

echo ""
echo "🔧 Son ayarlar yapılıyor..."

# Create directories if not exist
mkdir -p data
mkdir -p uploads
mkdir -p backups

echo ""
echo "================================================"
echo "        ✅ KURULUM BAŞARIYLA TAMAMLANDI!"
echo "================================================"
echo ""
echo "🎉 Arsarazi sisteminiz tamamen hazır!"
echo ""
echo "🚀 Server başlatılıyor..."
echo ""

# Start the server
node server-sqlite.js

echo ""
echo "Server kapandı. Tekrar başlatmak için:"
echo "   Mac/Linux: ./start.sh"
echo "   Manuel: npm start"
echo ""