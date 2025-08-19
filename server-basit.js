// ARSARAZI - BASİT BACKEND SERVER
// Bu dosyayı çalıştırmak için: node server-basit.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Basit admin bilgileri (gerçek projede şifre hash'lenir)
const ADMIN_EMAIL = "admin@arsarazi.com";
const ADMIN_PASSWORD = "admin123";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Basit veritabanı (JSON dosyası)
const DB_FILE = 'database.json';

// Veritabanı yoksa oluştur
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        gayrimenkuller: [
            {
                id: "KRS-2024-001",
                baslik: "Karesi Merkez Arsa",
                tip: "Arsa",
                konum: "Paşa Alanı Mahallesi",
                alan: 2500,
                fiyat: 1250000,
                durum: "Satılık",
                aciklama: "İmarlı, köşe parsel",
                tarih: new Date().toISOString()
            },
            {
                id: "BND-2024-002",
                baslik: "Bandırma Deniz Manzaralı Villa",
                tip: "Villa",
                konum: "Çınarlı Mahallesi",
                alan: 450,
                fiyat: 3500000,
                durum: "Satılık",
                aciklama: "3+1, havuzlu, deniz manzaralı",
                tarih: new Date().toISOString()
            },
            {
                id: "ALT-2024-003",
                baslik: "Altıeylül Tarla",
                tip: "Tarla",
                konum: "Çayırhisar Köyü",
                alan: 10000,
                fiyat: 500000,
                durum: "Satılık",
                aciklama: "Zeytinlik, su kuyusu mevcut",
                tarih: new Date().toISOString()
            }
        ],
        musteriler: [
            {
                id: "MUS-001",
                ad: "Ahmet Yılmaz",
                telefon: "0532 123 45 67",
                email: "ahmet.yilmaz@email.com",
                tip: "Yatırımcı",
                sehir: "Balıkesir",
                butce_min: 500000,
                butce_max: 2000000,
                ilgilendigi: ["Arsa", "Villa"],
                notlar: "Güvenilir müşteri, nakit ödeme",
                tarih: new Date().toISOString()
            },
            {
                id: "MUS-002",
                ad: "Ayşe Demir",
                telefon: "0544 987 65 43",
                email: "ayse.demir@email.com",
                tip: "Alıcı",
                sehir: "Bandırma",
                butce_min: 300000,
                butce_max: 1000000,
                ilgilendigi: ["Arsa"],
                notlar: "İlk defa alıcı, kredi kullanacak",
                tarih: new Date().toISOString()
            },
            {
                id: "MUS-003",
                ad: "Mehmet Kaya",
                telefon: "0555 678 90 12",
                email: "mehmet.kaya@email.com",
                tip: "Satıcı",
                sehir: "Altıeylül",
                sahip_oldugu: 3,
                notlar: "3 adet tarlası var, acil satış",
                tarih: new Date().toISOString()
            }
        ],
        islemler: [
            {
                id: "ISL-001",
                gayrimenkul_id: "KRS-2024-001",
                musteri_id: "MUS-001",
                tip: "Görüntüleme",
                durum: "Tamamlandı",
                tarih: new Date().toISOString(),
                notlar: "Müşteri arsayı beğendi, düşünecek"
            },
            {
                id: "ISL-002",
                gayrimenkul_id: "BND-2024-002",
                musteri_id: "MUS-002",
                tip: "Teklif",
                teklif_fiyat: 3200000,
                durum: "Beklemede",
                tarih: new Date().toISOString(),
                notlar: "Müşteri 3.2M teklif etti"
            }
        ],
        admin_girisleri: [],
        iletisim_mesajlari: []
    };
    
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Veritabanı oluşturuldu:', DB_FILE);
}

// Veritabanı okuma fonksiyonu
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Veritabanı okuma hatası:', error);
        return { gayrimenkuller: [], musteriler: [], islemler: [], admin_girisleri: [], iletisim_mesajlari: [] };
    }
}

// Veritabanı yazma fonksiyonu
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Veritabanı yazma hatası:', error);
        return false;
    }
}

// Basit admin doğrulama
function checkAdmin(email, password) {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// ========== API ENDPOINTS ==========

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Test
app.get('/api/test', (req, res) => {
    res.json({ 
        durum: 'Başarılı',
        mesaj: '✅ Backend çalışıyor!', 
        tarih: new Date().toLocaleString('tr-TR'),
        versiyon: '1.0.0'
    });
});

// İstatistikler
app.get('/api/istatistikler', (req, res) => {
    const db = readDatabase();
    
    // Gerçek verileri hesapla
    const toplam_gayrimenkul = db.gayrimenkuller.length;
    const aktif_musteriler = db.musteriler.length;
    
    // Bu ay işlemleri hesapla
    const buAy = new Date().getMonth();
    const buYil = new Date().getFullYear();
    const buAyIslemler = db.islemler.filter(islem => {
        const islemTarihi = new Date(islem.tarih);
        return islemTarihi.getMonth() === buAy && islemTarihi.getFullYear() === buYil;
    });
    const bu_ay_islem = buAyIslemler.length;
    
    // Toplam değer hesapla (tüm gayrimenkullerin toplam değeri)
    const toplam_deger = db.gayrimenkuller.reduce((toplam, gm) => {
        return toplam + (gm.fiyat || 0);
    }, 0);
    
    // Satılık gayrimenkul sayısı
    const satilik_gayrimenkul = db.gayrimenkuller.filter(gm => gm.durum === 'Satılık').length;
    
    // Toplam alan
    const toplam_alan = db.gayrimenkuller.reduce((toplam, gm) => {
        return toplam + (gm.alan || 0);
    }, 0);
    
    // Artış oranları (örnek veriler)
    const gayrimenkul_artis = toplam_gayrimenkul > 0 ? Math.floor(Math.random() * 20) + 5 : 0;
    const musteri_artis = aktif_musteriler > 0 ? Math.floor(Math.random() * 15) + 3 : 0;
    const islem_artis = bu_ay_islem > 0 ? Math.floor(Math.random() * 30) + 10 : 0;
    const deger_artis = toplam_deger > 0 ? Math.floor(Math.random() * 25) + 8 : 0;
    
    const istatistikler = {
        toplam_gayrimenkul,
        aktif_musteriler,
        bu_ay_islem,
        toplam_deger,
        satilik_gayrimenkul,
        toplam_alan,
        gayrimenkul_artis,
        musteri_artis,
        islem_artis,
        deger_artis
    };
    
    res.json({
        durum: 'Başarılı',
        veri: istatistikler
    });
});

// ========== GAYRİMENKUL API ==========

// Tüm gayrimenkulleri getir
app.get('/api/gayrimenkuller', (req, res) => {
    const db = readDatabase();
    res.json({
        durum: 'Başarılı',
        toplam: db.gayrimenkuller.length,
        veri: db.gayrimenkuller
    });
});

// Tek gayrimenkul getir
app.get('/api/gayrimenkuller/:id', (req, res) => {
    const db = readDatabase();
    const gayrimenkul = db.gayrimenkuller.find(g => g.id === req.params.id);
    
    if (gayrimenkul) {
        res.json({
            durum: 'Başarılı',
            veri: gayrimenkul
        });
    } else {
        res.status(404).json({
            durum: 'Hata',
            mesaj: 'Gayrimenkul bulunamadı'
        });
    }
});

// Yeni gayrimenkul ekle
app.post('/api/gayrimenkuller', (req, res) => {
    const db = readDatabase();
    const yeniGayrimenkul = {
        id: `GM-${Date.now()}`,
        ...req.body,
        tarih: new Date().toISOString()
    };
    
    db.gayrimenkuller.push(yeniGayrimenkul);
    writeDatabase(db);
    
    res.json({
        durum: 'Başarılı',
        mesaj: 'Gayrimenkul eklendi',
        veri: yeniGayrimenkul
    });
});

// Gayrimenkul güncelle
app.put('/api/gayrimenkuller/:id', (req, res) => {
    const db = readDatabase();
    const index = db.gayrimenkuller.findIndex(g => g.id === req.params.id);
    
    if (index !== -1) {
        db.gayrimenkuller[index] = {
            ...db.gayrimenkuller[index],
            ...req.body,
            guncelleme_tarihi: new Date().toISOString()
        };
        writeDatabase(db);
        
        res.json({
            durum: 'Başarılı',
            mesaj: 'Gayrimenkul güncellendi',
            veri: db.gayrimenkuller[index]
        });
    } else {
        res.status(404).json({
            durum: 'Hata',
            mesaj: 'Gayrimenkul bulunamadı'
        });
    }
});

// Gayrimenkul sil
app.delete('/api/gayrimenkuller/:id', (req, res) => {
    const db = readDatabase();
    const index = db.gayrimenkuller.findIndex(g => g.id === req.params.id);
    
    if (index !== -1) {
        db.gayrimenkuller.splice(index, 1);
        writeDatabase(db);
        
        res.json({
            durum: 'Başarılı',
            mesaj: 'Gayrimenkul silindi'
        });
    } else {
        res.status(404).json({
            durum: 'Hata',
            mesaj: 'Gayrimenkul bulunamadı'
        });
    }
});

// Toplu gayrimenkul güncelleme (yayınlama/yayından kaldırma için)
app.put('/api/gayrimenkuller', (req, res) => {
    const db = readDatabase();
    const { properties } = req.body;
    
    if (properties && Array.isArray(properties)) {
        db.gayrimenkuller = properties;
        writeDatabase(db);
        
        res.json({
            durum: 'Başarılı',
            mesaj: 'Gayrimenkuller güncellendi',
            toplam: properties.length
        });
    } else {
        res.status(400).json({
            durum: 'Hata',
            mesaj: 'Geçersiz veri formatı'
        });
    }
});

// Yayınlanan gayrimenkulleri getir (public API)
app.get('/api/public/gayrimenkuller', (req, res) => {
    const db = readDatabase();
    const publishedProperties = db.gayrimenkuller.filter(g => g.published === true);
    
    res.json({
        durum: 'Başarılı',
        toplam: publishedProperties.length,
        veri: publishedProperties
    });
});

// ========== MÜŞTERİ API ==========

// Tüm müşterileri getir
app.get('/api/musteriler', (req, res) => {
    const db = readDatabase();
    res.json({
        durum: 'Başarılı',
        toplam: db.musteriler.length,
        veri: db.musteriler
    });
});

// Tek müşteri getir
app.get('/api/musteriler/:id', (req, res) => {
    const db = readDatabase();
    const musteri = db.musteriler.find(m => m.id === req.params.id);
    
    if (musteri) {
        res.json({
            durum: 'Başarılı',
            veri: musteri
        });
    } else {
        res.status(404).json({
            durum: 'Hata',
            mesaj: 'Müşteri bulunamadı'
        });
    }
});

// Yeni müşteri ekle
app.post('/api/musteriler', (req, res) => {
    const db = readDatabase();
    const yeniMusteri = {
        id: `MUS-${Date.now()}`,
        ...req.body,
        tarih: new Date().toISOString()
    };
    
    db.musteriler.push(yeniMusteri);
    writeDatabase(db);
    
    res.json({
        durum: 'Başarılı',
        mesaj: 'Müşteri eklendi',
        veri: yeniMusteri
    });
});

// ========== İŞLEM API ==========

// Tüm işlemleri getir
app.get('/api/islemler', (req, res) => {
    const db = readDatabase();
    res.json({
        durum: 'Başarılı',
        toplam: db.islemler.length,
        veri: db.islemler
    });
});

// Yeni işlem ekle
app.post('/api/islemler', (req, res) => {
    const db = readDatabase();
    const yeniIslem = {
        id: `ISL-${Date.now()}`,
        ...req.body,
        tarih: new Date().toISOString()
    };
    
    db.islemler.push(yeniIslem);
    writeDatabase(db);
    
    res.json({
        durum: 'Başarılı',
        mesaj: 'İşlem eklendi',
        veri: yeniIslem
    });
});

// ========== ADMIN API ==========

// Admin giriş
app.post('/api/admin/giris', (req, res) => {
    const { email, password } = req.body;
    
    if (checkAdmin(email, password)) {
        // Giriş kaydını veritabanına ekle
        const db = readDatabase();
        const girisKaydi = {
            id: `GIRIS-${Date.now()}`,
            email: email,
            tarih: new Date().toISOString(),
            ip: req.ip || 'bilinmiyor'
        };
        
        db.admin_girisleri.push(girisKaydi);
        writeDatabase(db);
        
        res.json({
            durum: 'Başarılı',
            mesaj: 'Admin girişi başarılı',
            admin: {
                email: email,
                yetki: 'admin'
            }
        });
    } else {
        res.status(401).json({
            durum: 'Hata',
            mesaj: 'E-posta veya şifre hatalı'
        });
    }
});

// Admin giriş geçmişi
app.get('/api/admin/girisler', (req, res) => {
    const db = readDatabase();
    res.json({
        durum: 'Başarılı',
        toplam: db.admin_girisleri.length,
        veri: db.admin_girisleri
    });
});

// ========== İLETİŞİM API ==========

// İletişim mesajı gönder
app.post('/api/iletisim', (req, res) => {
    const { ad, email, telefon, mesaj } = req.body;
    
    if (!ad || !email || !mesaj) {
        return res.status(400).json({
            durum: 'Hata',
            mesaj: 'Ad, e-posta ve mesaj alanları zorunludur'
        });
    }
    
    const db = readDatabase();
    const yeniMesaj = {
        id: `MSG-${Date.now()}`,
        ad: ad,
        email: email,
        telefon: telefon || '',
        mesaj: mesaj,
        durum: 'Yeni',
        tarih: new Date().toISOString()
    };
    
    db.iletisim_mesajlari.push(yeniMesaj);
    writeDatabase(db);
    
    res.json({
        durum: 'Başarılı',
        mesaj: 'Mesajınız başarıyla gönderildi',
        veri: yeniMesaj
    });
});

// İletişim mesajlarını getir
app.get('/api/iletisim', (req, res) => {
    const db = readDatabase();
    res.json({
        durum: 'Başarılı',
        toplam: db.iletisim_mesajlari.length,
        veri: db.iletisim_mesajlari
    });
});

// ========== SERVER BAŞLAT ==========

app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║                                                      ║');
    console.log('║        🚀 ARSARAZI BACKEND BAŞARIYLA ÇALIŞIYOR!     ║');
    console.log('║                                                      ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║                                                      ║');
    console.log(`║  🌐 Site Adresi:    http://localhost:${PORT}           ║`);
    console.log(`║  📡 API Test:       http://localhost:${PORT}/api/test  ║`);
    console.log(`║  🏠 Gayrimenkuller: http://localhost:${PORT}/api/gayrimenkuller ║`);
    console.log(`║  👥 Müşteriler:     http://localhost:${PORT}/api/musteriler     ║`);
    console.log('║                                                      ║');
    console.log('║  💾 Veritabanı:     database.json                   ║');
    console.log('║  🔴 Kapatmak için:  Ctrl + C                        ║');
    console.log('║                                                      ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    console.log('📌 İPUCU: Tarayıcınızda http://localhost:' + PORT + ' adresine gidin\n');
});

// Hata yakalama
process.on('uncaughtException', (err) => {
    console.error('❌ HATA:', err.message);
    console.log('\n💡 ÇÖZÜM: npm install komutunu çalıştırın\n');
});