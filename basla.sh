#!/bin/bash

echo "========================================"
echo "     ARSARAZI BACKEND BAŞLATILIYOR"
echo "========================================"
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null
then
    echo "[HATA] Node.js kurulu değil!"
    echo ""
    echo "Lütfen önce Node.js kurun:"
    echo "1. nodejs.org sitesine gidin"
    echo "2. macOS Installer'ı indirin"
    echo "3. Kurun ve tekrar deneyin"
    echo ""
    echo "Veya Terminal'de: brew install node"
    exit
fi

echo "[OK] Node.js kurulu"
echo ""

# Hangi backend dosyası var kontrol et
if [ -f "backend-basit.js" ]; then
    echo "[OK] backend-basit.js bulundu"
    echo ""
    echo "Backend başlatılıyor..."
    echo ""
    node backend-basit.js
elif [ -f "server.js" ]; then
    echo "[OK] server.js bulundu"
    echo ""
    echo "Server başlatılıyor..."
    echo ""
    node server.js
elif [ -f "server-basit.js" ]; then
    echo "[OK] server-basit.js bulundu"
    echo ""
    echo "Server başlatılıyor..."
    echo ""
    node server-basit.js
else
    echo "[HATA] Backend dosyası bulunamadı!"
    echo ""
    echo "Lütfen şu dosyalardan birinin olduğundan emin olun:"
    echo "- backend-basit.js"
    echo "- server.js"
    echo "- server-basit.js"
    echo ""
fi