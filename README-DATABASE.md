# 🗄️ Arsarazi Veritabanı Sistemi

## 🎯 Özet

Arsarazi projesi artık **tamamen otomatik veritabanı sistemi** ile geliyor! Hiçbir teknik bilgi gerektirmeden, tek tıkla çalışan bir sistemdir.

## ✨ Özellikler

### 🚀 **Tek Tıkla Kurulum**
- PostgreSQL kurulumu **GEREKMİYOR**
- SQLite tabanlı, kurulum gerektirmeyen sistem
- Otomatik veri yükleme
- Admin hesabı otomatik oluşturma

### 📊 **Tam Özellikli Veritabanı**
- **Kullanıcı Yönetimi** - Admin/kullanıcı rolleri
- **Emlak Portföyü** - Arsa/villa/sanayi arsası yönetimi
- **İletişim Sistemi** - Form yönetimi ve takibi
- **Blog Sistemi** - İçerik yönetimi
- **Yedekleme Sistemi** - Otomatik backup/restore

### 🛡️ **Güvenlik ve Performans**
- JWT tabanlı kimlik doğrulama
- Şifreli parola saklama
- Rate limiting
- SQL injection koruması
- Otomatik yedekleme

---

## 🚀 Hızlı Başlangıç

### Seçenek 1: Tek Tıkla Kurulum (Önerilen)

```bash
# Windows:
setup-complete.bat    # Çift tıklayın

# Mac/Linux:  
chmod +x setup-complete.sh
./setup-complete.sh
```

### Seçenek 2: Manuel Kurulum

```bash
# 1. Modülleri yükle
npm install

# 2. Veritabanını kur
node setup-database.js

# 3. Server'ı başlat
npm start
```

---

## 📁 Veritabanı Dosyaları

```
data/
├── arsarazi.sqlite     # Ana veritabanı (SQLite)
└── arsarazi.json       # Yedek veritabanı (JSON)

backups/
├── arsarazi-backup-*.sqlite   # Otomatik yedekler
└── arsarazi-backup-*.json     # JSON yedekleri
```

---

## 🔧 Veritabanı Yönetimi

### Veritabanı Yöneticisi
```bash
node database-manager.js
```

Bu araç ile yapabilecekleriniz:
- 📥 **Yedek Al** - Veritabanınızı yedekleyin
- 📤 **Geri Yükle** - Yedekten geri yükleyin
- 🔄 **Sıfırla** - Temiz başlangıç
- 📊 **Durum** - Veritabanı bilgileri
- 🧹 **Temizle** - Eski yedekleri sil

### Komut Satırı İşlemleri
```bash
# Veritabanı durumu
npm run db-manager

# Yeni kurulum
npm run setup

# Server başlat (SQLite)
npm start

# Server başlat (PostgreSQL)
npm run server-postgres
```

---

## 📊 Veritabanı Şeması

### Tablolar

#### `users` - Kullanıcılar
- **id** - Benzersiz kimlik
- **name** - Kullanıcı adı
- **email** - E-posta (benzersiz)
- **password** - Şifreli parola
- **role** - Rol (admin/agent/user)
- **created_at, updated_at** - Zaman damgaları

#### `properties` - Emlaklar
- **id** - Benzersiz kimlik
- **title** - Başlık
- **description** - Açıklama
- **type** - Tür (Konut/Villa/Sanayi/Ticari/Tarım)
- **status** - Durum (Satılık/Satıldı/Rezerve/Pasif)
- **price** - Fiyat
- **area** - Alan (m²)
- **location** - Konum
- **features** - Özellikler (JSON)
- **images** - Fotoğraflar (JSON)
- **is_featured** - Öne çıkarılan
- **view_count** - Görüntüleme sayısı

#### `contact_submissions` - İletişim Formları
- **id** - Benzersiz kimlik
- **name** - Ad soyad
- **email** - E-posta
- **phone** - Telefon
- **subject** - Konu
- **message** - Mesaj
- **status** - Durum (new/responded/closed)
- **property_id** - İlgili emlak (opsiyonel)

#### `blog_posts` - Blog Yazıları
- **id** - Benzersiz kimlik
- **title** - Başlık
- **slug** - URL dostu başlık
- **content** - İçerik
- **excerpt** - Özet
- **featured_image** - Kapak fotoğrafı
- **status** - Durum (published/draft)
- **author_id** - Yazar kimliği

---

## 🔐 Varsayılan Giriş Bilgileri

### Admin Hesabı
- **E-posta:** admin@arsarazi.com
- **Şifre:** admin123

### API Test
```bash
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arsarazi.com","password":"admin123"}'
```

---

## 🔄 Migration ve Yedekleme

### Otomatik Yedekleme
- Her veritabanı işleminde otomatik yedek
- Tarih/saat damgalı dosyalar
- Hem SQLite hem JSON formatında

### Manuel Yedekleme
```bash
# Yedek al
node database-manager.js # -> Seçenek 1

# Belirli tarihteki yedekten geri yükle
node database-manager.js # -> Seçenek 2
```

### PostgreSQL'den SQLite'a Geçiş
```bash
# 1. PostgreSQL verilerini dışa aktar
pg_dump arsarazi_db > backup.sql

# 2. SQLite sistemini kur
node setup-database.js

# 3. Verileri manuel olarak aktarın (gerekirse)
```

---

## 🐛 Sorun Giderme

### Port Çakışması
```bash
# Port 5000 kullanımda
PORT=8080 npm start
```

### Veritabanı Bozulması
```bash
# Veritabanını sıfırla
node database-manager.js # -> Seçenek 3
```

### Modül Hatası
```bash
# Modülleri temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Better-sqlite3 Kurulum Sorunu
```bash
# Windows
npm install --build-from-source better-sqlite3

# Linux/Mac
sudo apt-get install build-essentials # Ubuntu
brew install python # macOS
npm install better-sqlite3
```

---

## 📈 Performans

### SQLite Avantajları
- ✅ **Kurulum Gerektirmez** - Tek dosya
- ✅ **Hızlı** - Yerel dosya erişimi
- ✅ **Güvenilir** - ACID uyumlu
- ✅ **Portable** - Herhangi bir yere kopyalayabilir
- ✅ **Yedekleme Kolay** - Dosya kopyalama

### Sınırlar
- ⚠️ **Eş zamanlı yazma** - Sınırlı (okuma sınırsız)
- ⚠️ **Boyut** - 281 TB'a kadar (pratik olarak sınırsız)
- ⚠️ **Network** - Sadece yerel erişim

### Ne Zaman PostgreSQL?
- Çok kullanıcılı sistemler
- Yüksek trafikli uygulamalar  
- Network veritabanı gereksinimi
- Karmaşık sorgular

---

## 🔧 Yapılandırma

### .env Dosyası
```bash
# Database Configuration
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/arsarazi.sqlite

# Server Configuration  
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### Gelişmiş Ayarlar
```javascript
// config/sqlite-database.js dosyasında
pragma('journal_mode = WAL');     // Write-Ahead Logging
pragma('synchronous = NORMAL');   // Performans
pragma('temp_store = MEMORY');    // Geçici veriler RAM'de
```

---

## 🤝 Destek

### Teknik Destek
- **GitHub Issues:** Kod ile ilgili sorunlar
- **Email:** info@arsarazi.com
- **Telefon:** +90 (266) 245-1234

### Yararlı Bağlantılar
- [SQLite Dokümantasyonu](https://sqlite.org/docs.html)
- [better-sqlite3 Kılavuzu](https://github.com/WiseLibs/better-sqlite3)
- [Node.js Kurulumu](https://nodejs.org/)

---

**🏡 Arsarazi - Balıkesir'in Güvenilir Gayrimenkul Ortağı**