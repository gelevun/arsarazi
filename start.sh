#!/bin/bash

# Arsarazi Backend Server Starter Script for Unix/Linux/macOS

echo ""
echo "========================================"
echo "   ARSARAZI BACKEND SERVER STARTER"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı! Lütfen Node.js yükleyin."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json bulunamadı!"
    echo "   Bu dosyayı proje klasöründe çalıştırın."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Gerekli paketler yükleniyor..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Paket yükleme başarısız!"
        exit 1
    fi
fi

# Check if .env exists, if not copy from example
if [ ! -f ".env" ]; then
    echo "📝 .env dosyası oluşturuluyor..."
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu. Gerekirse düzenleyin."
fi

echo "🚀 Server başlatılıyor..."
echo ""

# Start the server with the smart port detection
node start-server.js

echo ""
echo "Server kapandı."