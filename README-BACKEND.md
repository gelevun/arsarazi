# Arsarazi Backend - Balıkesir Arsa ve Arazi Uzmanı

Bu proje Balıkesir Karesi bölgesinde faaliyet gösteren Arsarazi gayrimenkul firması için geliştirilmiş modern, kapsamlı bir **Backend API** sistemidir.

## 🚀 **Proje Özellikleri**

### **Teknik Stack**
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Environment**: dotenv

### **API Endpoints**

#### **Authentication**
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri
- `PUT /api/auth/profile` - Profil güncelleme
- `POST /api/auth/logout` - Çıkış

#### **Properties (Arsalar)**
- `GET /api/properties` - Arsa listesi (filtreleme, sayfalama)
- `GET /api/properties/featured` - Öne çıkan arsalar
- `GET /api/properties/:id` - Tek arsa detayı
- `POST /api/properties` - Yeni arsa ekleme (Admin/Agent)
- `PUT /api/properties/:id` - Arsa güncelleme (Admin/Agent)
- `DELETE /api/properties/:id` - Arsa silme (Admin/Agent)
- `POST /api/properties/:id/favorite` - Favoriye ekleme/çıkarma

#### **Customers (Müşteriler)**
- `GET /api/customers` - Müşteri listesi (Admin/Agent)
- `POST /api/customers` - Yeni müşteri ekleme (Admin/Agent)
- `PUT /api/customers/:id` - Müşteri güncelleme (Admin/Agent)
- `DELETE /api/customers/:id` - Müşteri silme (Admin/Agent)

#### **Blog**
- `GET /api/blog` - Blog yazıları listesi
- `GET /api/blog/:id` - Tek blog yazısı

#### **Contact**
- `POST /api/contact` - İletişim formu gönderimi

#### **File Upload**
- `POST /api/upload/single` - Tek dosya yükleme (Admin/Agent)
- `POST /api/upload/multiple` - Çoklu dosya yükleme (Admin/Agent)
- `DELETE /api/upload/:filename` - Dosya silme (Admin/Agent)

#### **System**
- `GET /api/health` - Sistem sağlık kontrolü

## 📦 **Kurulum ve Çalıştırma**

### **Gereksinimler**
- Node.js (v16+)
- PostgreSQL (v12+)
- npm veya yarn

### **1. Bağımlılıkları Yükle**
```bash
npm install
```

### **2. Environment Variables**
`.env` dosyasını oluşturun (`.env.example`'dan kopyalayın):
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arsarazi_db
DB_USER=arsarazi_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### **3. PostgreSQL Database Kurulumu**

#### **PostgreSQL Kurulumu (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **Database ve User Oluşturma**
```bash
sudo -u postgres psql

-- PostgreSQL içinde
CREATE DATABASE arsarazi_db;
CREATE USER arsarazi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE arsarazi_db TO arsarazi_user;
\q
```

### **4. Database Migration**
```bash
npm run migrate
```

### **5. Sample Data Yükleme**
```bash
npm run seed
```

### **6. Server Başlatma**

#### **Development Mode**
```bash
npm run dev
```

#### **Production Mode**
```bash
npm start
```

### **7. Test ve Doğrulama**

Tarayıcıda aşağıdaki URL'leri test edin:
- **Health Check**: http://localhost:3000/api/health
- **Frontend**: http://localhost:3000
- **API Docs**: API endpoints'leri Postman ile test edebilirsiniz

## 👤 **Default Admin User**

Migration sonrası varsayılan admin kullanıcısı:
- **Email**: admin@arsarazi.com
- **Password**: admin123

## 🗂️ **Proje Yapısı**

```
arsarazi-backend/
├── config/
│   └── database.js          # Database connection config
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── properties.js        # Property management routes
│   ├── customers.js         # Customer management routes
│   ├── blog.js              # Blog routes
│   ├── contact.js           # Contact form routes
│   └── upload.js            # File upload routes
├── scripts/
│   ├── migrate.js           # Database migration
│   └── seed.js              # Sample data seeding
├── public/                  # Frontend static files
│   ├── index.html           # Main page
│   └── js/
│       └── api-integration.js
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies and scripts
└── server.js                # Main server file
```

## 🔒 **Güvenlik Özellikleri**

- **JWT Authentication** - Token tabanlı kimlik doğrulama
- **Password Hashing** - bcryptjs ile şifre hashleme
- **Rate Limiting** - API istek sınırlama
- **CORS Protection** - Cross-origin kaynak koruması
- **Helmet Security** - HTTP güvenlik başlıkları
- **Input Validation** - Joi ile veri doğrulama
- **SQL Injection Protection** - Parameterized queries

## 📊 **Database Schema**

### **Ana Tablolar**
- **users** - Kullanıcı hesapları (admin, agent, user)
- **properties** - Arsa/arazi bilgileri
- **customers** - Müşteri bilgileri ve CRM
- **blog_posts** - Blog yazıları
- **contact_submissions** - İletişim form kayıtları
- **property_favorites** - Kullanıcı favorileri

### **İlişkiler**
- Users → Properties (created_by)
- Users → Customers (assigned_agent)
- Users → Blog Posts (author_id)
- Users ↔ Properties (favorites - many-to-many)

## 🚀 **Production Deployment**

### **PM2 ile Deployment**
```bash
npm install -g pm2

# Start application
pm2 start server.js --name "arsarazi-backend"

# Monitor
pm2 monit

# Logs
pm2 logs arsarazi-backend

# Restart
pm2 restart arsarazi-backend
```

### **Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 **Debugging ve Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   ```bash
   # PostgreSQL servisini kontrol et
   sudo systemctl status postgresql
   
   # Database'in var olduğunu kontrol et
   sudo -u postgres psql -l
   ```

2. **Permission Errors**
   ```bash
   # Upload klasörü izinleri
   mkdir -p uploads
   chmod 755 uploads
   ```

3. **Port Already in Use**
   ```bash
   # Port 3000'i kullanan process'i bul
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

### **Logs ve Monitoring**
- **Console Logs**: `console.log` ile detaylı loglama
- **Error Handling**: Global error handler ile merkezi hata yönetimi
- **Health Check**: `/api/health` endpoint ile sistem durumu

## 📞 **Destek ve İletişim**

**Firma Bilgileri:**
- **Adres**: Paşa Alanı Mahallesi, Çengel Cad. No: 108A, Karesi / Balıkesir
- **Telefon**: +90 (266) 245-1234
- **E-posta**: info@arsarazi.com

**Geliştirici Notları:**
- Backend API tam functional durumda
- Frontend entegrasyonu tamamlandı
- Production ready
- Scalable architecture

---

## 🔄 **Son Güncelleme**: 18 Ocak 2024

**Proje Durumu**: ✅ **Production Ready** - Tüm temel özellikler tamamlandı ve test edildi.