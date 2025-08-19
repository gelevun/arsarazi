#!/usr/bin/env node

/**
 * 🗄️ ARSARAZI VERİTABANI YÖNETİCİSİ
 * 
 * Bu araç veritabanınızı yedekler, geri yükler ve yönetir.
 * Hiçbir teknik bilgi gerektirmez!
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_DIR = path.join(__dirname, 'backups');
const DB_FILE = path.join(DATA_DIR, 'arsarazi.sqlite');

console.log(`
🗄️ =====================================
   ARSARAZI VERİTABANI YÖNETİCİSİ
=====================================

Bu araç ile yapabilecekleriniz:
📥 1. Veritabanı yedeği al
📤 2. Yedekten geri yükle  
🔄 3. Veritabanını sıfırla
📊 4. Veritabanı durumu
🧹 5. Eski yedekleri temizle
❌  0. Çıkış
`);

// Kullanıcı girişi alma
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Backup klasörünü oluştur
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log('📁 Backup klasörü oluşturuldu');
  }
}

// Veritabanı yedeği al
async function backupDatabase() {
  try {
    console.log('📥 Veritabanı yedeği alınıyor...');
    
    await ensureBackupDir();
    
    // Check if database exists
    try {
      await fs.access(DB_FILE);
    } catch {
      console.log('❌ Veritabanı dosyası bulunamadı!');
      console.log('   Önce veritabanını kurmanız gerekiyor: node setup-database.js');
      return false;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `arsarazi-backup-${timestamp}.sqlite`);
    
    // Copy database file
    await fs.copyFile(DB_FILE, backupFile);
    
    // Also backup JSON data if exists
    const jsonFile = path.join(DATA_DIR, 'arsarazi.json');
    try {
      await fs.access(jsonFile);
      const jsonBackupFile = path.join(BACKUP_DIR, `arsarazi-backup-${timestamp}.json`);
      await fs.copyFile(jsonFile, jsonBackupFile);
      console.log('✅ JSON veritabanı da yedeklendi');
    } catch {
      // JSON file doesn't exist, that's ok
    }
    
    console.log(`✅ Yedek başarıyla oluşturuldu:`);
    console.log(`   📁 ${backupFile}`);
    
    // Show backup info
    const stats = await fs.stat(backupFile);
    console.log(`   📏 Boyut: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📅 Tarih: ${stats.birthtime.toLocaleString('tr-TR')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Yedekleme hatası:', error.message);
    return false;
  }
}

// Yedekten geri yükle
async function restoreDatabase() {
  try {
    console.log('📤 Yedekler listeleniyor...\n');
    
    const backupFiles = await fs.readdir(BACKUP_DIR);
    const sqliteBackups = backupFiles
      .filter(file => file.endsWith('.sqlite'))
      .sort()
      .reverse();
    
    if (sqliteBackups.length === 0) {
      console.log('❌ Hiç yedek dosyası bulunamadı!');
      return false;
    }
    
    console.log('Mevcut yedekler:');
    for (let i = 0; i < sqliteBackups.length; i++) {
      const file = sqliteBackups[i];
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      console.log(`${i + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB - ${stats.birthtime.toLocaleString('tr-TR')})`);
    }
    
    const choice = await question(`\nHangi yedeği geri yüklemek istiyorsunuz? (1-${sqliteBackups.length}): `);
    const choiceNum = parseInt(choice);
    
    if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > sqliteBackups.length) {
      console.log('❌ Geçersiz seçim!');
      return false;
    }
    
    const selectedBackup = sqliteBackups[choiceNum - 1];
    const backupPath = path.join(BACKUP_DIR, selectedBackup);
    
    // Confirm
    const confirm = await question(`⚠️  Mevcut veritabanı silinecek! Devam etmek istediğinizden emin misiniz? (y/N): `);
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ İşlem iptal edildi');
      return false;
    }
    
    console.log('🔄 Geri yükleme işlemi başlıyor...');
    
    // Create current backup first
    await backupDatabase();
    
    // Restore from backup
    await fs.copyFile(backupPath, DB_FILE);
    
    console.log('✅ Veritabanı başarıyla geri yüklendi!');
    console.log(`   📁 Kaynak: ${selectedBackup}`);
    
    return true;
  } catch (error) {
    console.error('❌ Geri yükleme hatası:', error.message);
    return false;
  }
}

// Veritabanını sıfırla
async function resetDatabase() {
  try {
    const confirm = await question('⚠️  Tüm veriler silinecek! Emin misiniz? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ İşlem iptal edildi');
      return false;
    }
    
    console.log('🔄 Veritabanı sıfırlanıyor...');
    
    // Backup first
    console.log('📥 Önce yedek alınıyor...');
    await backupDatabase();
    
    // Delete database files
    try {
      await fs.unlink(DB_FILE);
      console.log('🗑️ SQLite veritabanı silindi');
    } catch {}
    
    try {
      await fs.unlink(path.join(DATA_DIR, 'arsarazi.json'));
      console.log('🗑️ JSON veritabanı silindi');
    } catch {}
    
    // Recreate database
    console.log('🏗️ Yeni veritabanı oluşturuluyor...');
    const { initialize } = require('./config/sqlite-database');
    await initialize();
    
    console.log('✅ Veritabanı başarıyla sıfırlandı!');
    console.log('   👤 Admin: admin@arsarazi.com / admin123');
    
    return true;
  } catch (error) {
    console.error('❌ Sıfırlama hatası:', error.message);
    return false;
  }
}

// Veritabanı durumu
async function showDatabaseStatus() {
  try {
    console.log('📊 Veritabanı Durumu:\n');
    
    // Check SQLite database
    try {
      const stats = await fs.stat(DB_FILE);
      console.log(`✅ SQLite Veritabanı:`);
      console.log(`   📁 Dosya: ${DB_FILE}`);
      console.log(`   📏 Boyut: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`   📅 Son Değişim: ${stats.mtime.toLocaleString('tr-TR')}`);
    } catch {
      console.log('❌ SQLite veritabanı bulunamadı');
    }
    
    // Check JSON database
    const jsonFile = path.join(DATA_DIR, 'arsarazi.json');
    try {
      const stats = await fs.stat(jsonFile);
      console.log(`\n✅ JSON Yedek Veritabanı:`);
      console.log(`   📁 Dosya: ${jsonFile}`);
      console.log(`   📏 Boyut: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`   📅 Son Değişim: ${stats.mtime.toLocaleString('tr-TR')}`);
    } catch {
      console.log('\n⚠️ JSON yedek veritabanı bulunamadı');
    }
    
    // Show table counts
    try {
      const { query } = require('./config/sqlite-database');
      
      console.log('\n📈 Tablo İstatistikleri:');
      
      const tables = ['users', 'properties', 'customers', 'contact_submissions', 'blog_posts'];
      for (const table of tables) {
        try {
          const result = query(`SELECT COUNT(*) as count FROM ${table}`);
          const count = result[0]?.count || 0;
          console.log(`   ${table}: ${count} kayıt`);
        } catch {}
      }
    } catch {
      console.log('\n❌ Tablo istatistikleri alınamadı');
    }
    
    // Show backup info
    try {
      const backupFiles = await fs.readdir(BACKUP_DIR);
      const sqliteBackups = backupFiles.filter(file => file.endsWith('.sqlite'));
      
      console.log(`\n💾 Yedek Dosyaları: ${sqliteBackups.length} adet`);
      
      if (sqliteBackups.length > 0) {
        const latestBackup = sqliteBackups.sort().reverse()[0];
        const backupStats = await fs.stat(path.join(BACKUP_DIR, latestBackup));
        console.log(`   📁 Son Yedek: ${latestBackup}`);
        console.log(`   📅 Tarih: ${backupStats.birthtime.toLocaleString('tr-TR')}`);
      }
    } catch {
      console.log('\n❌ Yedek bilgileri alınamadı');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Durum kontrolü hatası:', error.message);
    return false;
  }
}

// Eski yedekleri temizle
async function cleanOldBackups() {
  try {
    const keepDays = await question('Kaç günden eski yedekleri silelim? (varsayılan: 30): ');
    const days = parseInt(keepDays) || 30;
    
    console.log(`🧹 ${days} günden eski yedekler temizleniyor...`);
    
    const backupFiles = await fs.readdir(BACKUP_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let deletedCount = 0;
    let savedSpace = 0;
    
    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.birthtime < cutoffDate) {
        savedSpace += stats.size;
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`   🗑️ Silindi: ${file}`);
      }
    }
    
    console.log(`✅ Temizlik tamamlandı:`);
    console.log(`   🗑️ ${deletedCount} dosya silindi`);
    console.log(`   💾 ${(savedSpace / 1024 / 1024).toFixed(2)} MB alan boşaltıldı`);
    
    return true;
  } catch (error) {
    console.error('❌ Temizlik hatası:', error.message);
    return false;
  }
}

// Ana menü
async function showMenu() {
  while (true) {
    console.log('\n' + '='.repeat(40));
    const choice = await question('Seçiminizi yapın (0-5): ');
    
    switch (choice) {
      case '1':
        await backupDatabase();
        break;
      case '2':
        await restoreDatabase();
        break;
      case '3':
        await resetDatabase();
        break;
      case '4':
        await showDatabaseStatus();
        break;
      case '5':
        await cleanOldBackups();
        break;
      case '0':
        console.log('👋 Çıkılıyor...');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Geçersiz seçim! Lütfen 0-5 arasında bir rakam girin.');
    }
    
    await question('\nDevam etmek için Enter tuşuna basın...');
    console.clear();
    console.log(`
🗄️ =====================================
   ARSARAZI VERİTABANI YÖNETİCİSİ
=====================================

Bu araç ile yapabilecekleriniz:
📥 1. Veritabanı yedeği al
📤 2. Yedekten geri yükle  
🔄 3. Veritabanını sıfırla
📊 4. Veritabanı durumu
🧹 5. Eski yedekleri temizle
❌ 0. Çıkış
`);
  }
}

// Ana program
if (require.main === module) {
  showMenu().catch(console.error);
}