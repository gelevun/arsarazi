# 🏢 Arsarazi - Balıkesir Gayrimenkul Uzmanı

> **Arsarazi** Balıkesir'in güvenilir arsa ve arazi uzmanı. Karesi'den Bandırma'ya, tüm Balıkesir genelinde kaliteli gayrimenkul hizmetleri.

## 📍 İletişim Bilgileri
- **Adres:** Paşa Alanı Mahallesi, Çengel Cad. No: 108A, Karesi / Balıkesir
- **Telefon:** +90 (266) 245-1234
- **E-posta:** info@arsarazi.com

---

## 🚀 Port Çakışması Çözüldü!

**Sorun:** Port 3000 başka bir uygulama tarafından kullanılıyordu.
**Çözüm:** Server artık **port 5000**'de çalışacak ve gerekirse otomatik olarak alternatif portları deneyecek.

### ⚡ Hızlı Başlangıç

#### Windows Kullanıcıları:
```cmd
# Çift tıklayın veya komut satırından çalıştırın:
start.bat
```

#### Mac/Linux Kullanıcıları:
```bash
# Terminal'de çalıştırın:
chmod +x start.sh
./start.sh
```

#### Manuel Başlatma:
```bash
npm install  # İlk çalıştırmada
npm start    # Server'ı başlat
```

---

## 🌐 Erişim Adresleri

### Frontend (Web Sitesi)
- **Ana Sayfa:** http://localhost:5000
- **Portfolio:** http://localhost:5000/portfolio.html
- **Blog:** http://localhost:5000/blog.html
- **Hakkımızda:** http://localhost:5000/about.html
- **İletişim:** http://localhost:5000/contact.html
- **Admin Panel:** http://localhost:5000/admin.html

### CRM Yönetim Sistemi
- **CRM Dashboard:** http://localhost:5000/dashboard.html
- **Gayrimenkul Yönetimi:** http://localhost:5000/crm-properties.html
- **Müşteri Yönetimi:** http://localhost:5000/crm-customers.html
- **İşlem Takibi:** http://localhost:5000/crm-transactions.html
- **Doküman Yönetimi:** http://localhost:5000/crm-documents.html

### Backend API
- **API Base:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Auth:** http://localhost:5000/api/auth
- **Properties:** http://localhost:5000/api/properties

---

## 🔐 Demo Giriş Bilgileri

### Admin Paneli
- **E-posta:** admin@arsarazi.com
- **Şifre:** admin123

---

## 🗄️ Veritabanı Kurulumu

### 1. PostgreSQL Kurulumu ve Hazırlık
```bash
# PostgreSQL yüklü olmalı (psql komutunu test edin)
psql --version

# Veritabanı oluştur
sudo -u postgres createdb arsarazi_db
sudo -u postgres createuser arsarazi_user -P
# Şifre: arsarazi123

# Kullanıcıya yetki ver
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE arsarazi_db TO arsarazi_user;"
```

### 2. Database Migration ve Seed
```bash
# Tabloları oluştur
npm run migrate

# Demo verilerini yükle
npm run seed

# Veya hepsini sıfırla ve yeniden yükle
npm run reset-db
```

---

## 📁 Proje Yapısı

```
arsarazi/
├── 📄 Frontend Dosyaları
│   ├── index.html              # Ana sayfa
│   ├── portfolio.html          # Emlak portföyü
│   ├── blog.html              # Blog sayfası
│   ├── about.html             # Hakkımızda sayfası
│   ├── contact.html           # İletişim sayfası
│   ├── blog-detail.html       # Blog detay sayfası
│   ├── property-detail.html   # Emlak detay sayfası
│   ├── admin.html             # Admin paneli
│   └── public/
│       └── js/api-integration.js  # API entegrasyonu
│
├── 🔧 Backend Dosyaları
│   ├── server.js              # Ana server
│   ├── start-server.js        # Akıllı port yönetimi
│   ├── package.json
│   ├── .env                   # Ortam değişkenleri
│   │
│   ├── config/
│   │   └── database.js        # PostgreSQL bağlantısı
│   │
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Kimlik doğrulama
│   │   ├── properties.js     # Emlak yönetimi
│   │   ├── customers.js      # Müşteri yönetimi
│   │   ├── blog.js           # Blog yazıları
│   │   ├── contact.js        # İletişim formu
│   │   └── upload.js         # Dosya yükleme
│   │
│   ├── middleware/            # Güvenlik katmanları
│   │   ├── auth.js           # JWT doğrulama
│   │   └── validation.js     # Veri doğrulama
│   │
│   └── scripts/              # Veritabanı scriptleri
│       ├── migrate.js        # Tablo oluşturma
│       └── seed.js           # Demo veri yükleme
│
└── 📚 Başlatma Dosyaları
    ├── start.bat             # Windows için
    └── start.sh              # Mac/Linux için
```

---

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler
- 🏠 **Emlak Portföyü:** Arsalar, villalar, sanayi arazileri
- 🔍 **Gelişmiş Arama:** Konum, alan, fiyat filtreleri
- 👤 **Admin Paneli:** Emlak yönetimi, müşteri takibi
- 📱 **Responsive Tasarım:** Mobil uyumlu arayüz
- 🔐 **Güvenli API:** JWT kimlik doğrulama
- 🗄️ **PostgreSQL Veritabanı:** Profesyonel veri yönetimi
- 📧 **İletişim Formu:** Otomatik bildirimler
- ⚡ **Akıllı Port Yönetimi:** Çakışma otomatik çözümü
- 📖 **Blog Sistemi:** Gayrimenkul haberleri ve makaleler
- 👥 **Hakkımızda Sayfası:** Şirket bilgileri ve ekip tanıtımı
- 📞 **İletişim Sayfası:** İletişim formu, harita ve SSS bölümü

### 🔄 Geliştirme Aşamasında
- 📊 **Dashboard Analytics:** Satış raporları
- 📄 **PDF Rapor:** Emlak listeleri
- 🖼️ **Fotoğraf Yönetimi:** Çoklu resim yükleme
- 📱 **Push Bildirimleri:** Yeni emlak duyuruları

---

## 🔧 Troubleshooting (Sorun Giderme)

### Port Çakışması Sorunu
```bash
# Hangi uygulama port kullanıyor?
netstat -tulpn | grep :3000    # Linux/Mac
netstat -ano | findstr :3000   # Windows

# Süreci sonlandır
kill -9 <PID>                  # Linux/Mac
taskkill /PID <PID> /F         # Windows
```

### Veritabanı Bağlantı Sorunu
```bash
# PostgreSQL servisini kontrol et
sudo systemctl status postgresql    # Linux
brew services list postgresql       # Mac (Homebrew)

# Bağlantıyı test et
psql -h localhost -U arsarazi_user -d arsarazi_db
```

### Node.js Modül Sorunu
```bash
# Node modules temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

---

## 🌟 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/profile` - Profil bilgileri

### Properties (Emlak)
- `GET /api/properties` - Emlak listesi
- `GET /api/properties/featured` - Öne çıkan emlaklar
- `POST /api/properties` - Yeni emlak ekle (Admin)
- `PUT /api/properties/:id` - Emlak güncelle (Admin)
- `DELETE /api/properties/:id` - Emlak sil (Admin)

### Contact
- `POST /api/contact` - İletişim formu gönder

---

## 🔄 Versiyonlama

### v1.0.0 (Mevcut)
- ✅ Temel emlak portföyü
- ✅ Admin paneli
- ✅ API entegrasyonu
- ✅ PostgreSQL veritabanı
- ✅ Port çakışması çözümü

### v1.1.0 (Planlanan)
- 🔄 GitHub entegrasyonu
- 🔄 Otomatik deployment
- 🔄 Analytics dashboard
- 🔄 Email bildirimleri

---

## 🔄 GitHub Entegrasyonu

### 📚 Başlangıç Seviyesi İçin Dökümanlar
- **[BASIT-ANLATIM.txt](BASIT-ANLATIM.txt)** - En basit Türkçe anlatım (5 dakika)
- **[GITHUB-KILAVUZ.md](GITHUB-KILAVUZ.md)** - Detaylı görsel anlatım
- **[github-yukle.bat](github-yukle.bat)** - Windows otomatik yükleme

### 📤 Kodları GitHub'a Yükleme - 3 Yöntem

#### 🟢 YENİ BAŞLAYANLAR İÇİN (Tavsiye Edilen):
1. **BASIT-ANLATIM.txt** dosyasını açın
2. Adım adım takip edin
3. 5 dakikada siteniz yayında!

#### 🟡 OTOMATİK YÜKLEME (Windows):
```cmd
# github-yukle.bat dosyasına çift tıklayın
# Yönlendirmeleri takip edin
```

#### 🔴 MANUEL (Gelişmiş):
```bash
git init
git add .
git commit -m "İlk yükleme"
git remote add origin https://github.com/[kullaniciadi]/arsarazi.git
git push -u origin main
```

### 🚀 GitHub Actions CI/CD

Repository'ye push yaptığınızda otomatik olarak:
- ✅ **Code Quality Check** - Kod kalitesi kontrolü
- ✅ **Database Tests** - PostgreSQL bağlantı testleri  
- ✅ **API Testing** - Endpoint'lerin çalışma testi
- ✅ **Build Artifacts** - Production dosyaları oluşturma

**Actions URL:** https://github.com/gelevun/arsarazi/actions

### 📊 Repository Bilgileri
- **GitHub URL:** https://github.com/gelevun/arsarazi
- **Clone:** `git clone https://github.com/gelevun/arsarazi.git`
- **Issues:** https://github.com/gelevun/arsarazi/issues
- **Wiki:** https://github.com/gelevun/arsarazi/wiki

---

## 📞 Destek

Teknik sorunlar için:
- **GitHub Issues:** Projeye özel sorunlar
- **Email:** info@arsarazi.com
- **Telefon:** +90 (266) 245-1234

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🏡 Arsarazi - Balıkesir'in Güvenilir Gayrimenkul Ortağı**