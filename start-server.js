#!/usr/bin/env node

/**
 * Arsarazi Backend Server Startup Script
 * Handles port conflicts and provides better error messages
 */

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

// Load environment variables
require('dotenv').config();

const DEFAULT_PORT = process.env.PORT || 5000;
const FALLBACK_PORTS = [5000, 5001, 5002, 8000, 8080, 8888];

// Check if port is available
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

// Find available port
const findAvailablePort = async () => {
  console.log(`🔍 Port ${DEFAULT_PORT} kontrol ediliyor...`);
  
  if (await checkPort(DEFAULT_PORT)) {
    return DEFAULT_PORT;
  }
  
  console.log(`❌ Port ${DEFAULT_PORT} kullanımda. Alternatif portlar deneniyor...`);
  
  for (const port of FALLBACK_PORTS) {
    if (await checkPort(port)) {
      console.log(`✅ Port ${port} uygun bulundu!`);
      return port;
    }
  }
  
  throw new Error('Uygun port bulunamadı. Lütfen bazı servisleri kapatın.');
};

// Start server with available port
const startServer = async () => {
  try {
    console.log('🚀 Arsarazi Backend Server başlatılıyor...\n');
    
    const availablePort = await findAvailablePort();
    
    // Update PORT environment variable
    process.env.PORT = availablePort;
    
    console.log(`📡 Server Port: ${availablePort}`);
    console.log(`🌐 Web Adresi: http://localhost:${availablePort}`);
    console.log(`📊 API Adresi: http://localhost:${availablePort}/api`);
    console.log(`🏥 Health Check: http://localhost:${availablePort}/api/health`);
    console.log('\n📋 Önemli Bilgiler:');
    console.log('   • Veritabanı bağlantısını kontrol edin');
    console.log('   • Seed verilerini yüklemek için: npm run seed');
    console.log('   • Admin giriş: admin@arsarazi.com / admin123');
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Start the main server
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: availablePort }
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Server başlatma hatası:', error.message);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server kapandı (kod: ${code})`);
        process.exit(code);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔄 Server kapatılıyor...');
      serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🔄 Server kapatılıyor...');
      serverProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Startup Error:', error.message);
    console.log('\n🔧 Çözüm önerileri:');
    console.log('   1. Çalışan servisleri kontrol edin: netstat -tulpn | grep LISTEN');
    console.log('   2. Port 3000\'i kullanan uygulamayı kapatın');
    console.log('   3. Sistem yeniden başlatın');
    console.log('   4. Farklı bir port kullanın: PORT=8080 node start-server.js');
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer, checkPort, findAvailablePort };