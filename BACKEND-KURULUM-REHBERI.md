# 🚀 BACKEND (ARKA PLAN) KURULUM REHBERİ
## Hiç Yazılım Bilmeyenler İçin Adım Adım Anlatım

---

## 📌 BACKEND NEDİR?
Backend, web sitenizin "görünmeyen" kısmıdır. Tıpkı bir restorandaki mutfak gibi. Müşteriler yemeği görür ama mutfakta neler olduğunu görmez. Backend de öyle - verileri saklar, işler ve sitenize gönderir.

---

## 🎯 NEYİ KURACAĞIZ?
1. **Node.js** - JavaScript'i bilgisayarınızda çalıştıran program
2. **Veritabanı** - Bilgilerin saklandığı dijital dolap
3. **Server** - Sitenizi internete bağlayan köprü

---

# ADIM 1: GEREKLİ PROGRAMLARI KURMA

## 1.1 Node.js Kurulumu (10 dakika)

### Windows için:

1. **Tarayıcınızı açın**
2. **Adres çubuğuna yazın:** `nodejs.org`
3. **Enter'a basın**
4. **Yeşil düğmeye tıklayın:** "LTS Windows Installer"
   - Dosya inecek (yaklaşık 30 MB)
5. **İndirilen dosyayı çift tıklayın**
6. **Kurulum ekranında:**
   - "Next" (İleri) tıklayın
   - "I accept" (Kabul ediyorum) işaretleyin → Next
   - Next → Next → Next → Install
   - Windows sizden izin isterse "Evet" deyin
   - "Finish" (Bitir) tıklayın

### ✅ Node.js Kuruldu mu? TEST EDELİM:

1. **Windows tuşu + R** basın
2. **cmd** yazın → Enter
3. **Siyah ekran açılacak, şunu yazın:**
   ```
   node --version
   ```
4. **Enter'a basın**
5. **v20.11.0** gibi bir sayı görüyorsanız ✅ BAŞARILI!

---

# ADIM 2: PROJENİZİ HAZIR HALE GETİRME

## 2.1 Proje Klasörünüzü Bulma

1. **Masaüstünde** "arsarazi" klasörünüz olmalı
2. **Bu klasörü açın** (çift tıklayın)
3. **Adres çubuğuna tıklayın** (en üstte dosya yolu yazan yer)
4. **cmd** yazın → Enter
5. **Siyah ekran açılacak** - Bu sizin proje terminaliniz

---

# ADIM 3: GEREKLİ DOSYALARI YÜKLEME

## 3.1 Paketleri Kurma (5 dakika)

**Açtığınız siyah ekrana** sırayla şunları yazın:

1. İlk komut (Enter'a basın):
   ```
   npm init -y
   ```
   ✅ package.json dosyası oluştu

2. İkinci komut (Enter'a basın):
   ```
   npm install express cors dotenv
   ```
   ⏳ Biraz bekleyin... Yükleniyor...
   ✅ node_modules klasörü oluştu

3. Üçüncü komut (Enter'a basın):
   ```
   npm install sqlite3
   ```
   ⏳ Biraz bekleyin...
   ✅ SQLite veritabanı kuruldu

---

# ADIM 4: BACKEND KODUNU OLUŞTURMA

## 4.1 Basit Server Dosyası

**ÖNEMLİ:** Aşağıdaki kodu kopyalayıp, Notepad'e yapıştırın ve "server-basit.js" olarak kaydedin.

```javascript
// BASİT SERVER KODU - server-basit.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Ayarlar
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Test
app.get('/api/test', (req, res) => {
    res.json({ 
        mesaj: 'Backend çalışıyor!', 
        tarih: new Date().toLocaleString('tr-TR') 
    });
});

// Gayrimenkul listesi (örnek veri)
app.get('/api/gayrimenkuller', (req, res) => {
    const ornekVeriler = [
        {
            id: 1,
            baslik: "Karesi Merkez Arsa",
            fiyat: 500000,
            alan: 1000,
            durum: "Satılık"
        },
        {
            id: 2,
            baslik: "Bandırma Villa",
            fiyat: 1500000,
            alan: 300,
            durum: "Satılık"
        }
    ];
    res.json(ornekVeriler);
});

// Müşteri listesi (örnek veri)
app.get('/api/musteriler', (req, res) => {
    const musteriler = [
        {
            id: 1,
            ad: "Ahmet Yılmaz",
            telefon: "0532 123 45 67",
            tip: "Yatırımcı"
        },
        {
            id: 2,
            ad: "Ayşe Demir",
            telefon: "0544 987 65 43",
            tip: "Alıcı"
        }
    ];
    res.json(musteriler);
});

// Server'ı başlat
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║                                        ║');
    console.log('║     🚀 SERVER BAŞARIYLA ÇALIŞIYOR!    ║');
    console.log('║                                        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║                                        ║');
    console.log(`║  Siteniz: http://localhost:${PORT}       ║`);
    console.log('║                                        ║');
    console.log('║  Kapatmak için: Ctrl + C              ║');
    console.log('║                                        ║');
    console.log('╚════════════════════════════════════════╝');
});
```

---

# ADIM 5: SERVER'I ÇALIŞTIRMA

## 5.1 Başlatma

1. **Siyah ekrana (terminal) geri dönün**
2. **Şunu yazın:**
   ```
   node server-basit.js
   ```
3. **Enter'a basın**

## 5.2 Başarılı mı?

Şöyle bir görüntü göreceksiniz:
```
╔════════════════════════════════════════╗
║                                        ║
║     🚀 SERVER BAŞARIYLA ÇALIŞIYOR!    ║
║                                        ║
╠════════════════════════════════════════╣
║                                        ║
║  Siteniz: http://localhost:5000       ║
║                                        ║
║  Kapatmak için: Ctrl + C              ║
║                                        ║
╚════════════════════════════════════════╝
```

---

# ADIM 6: TEST ETME

## 6.1 Sitenizi Açın

1. **Chrome'u açın**
2. **Adres çubuğuna yazın:** `localhost:5000`
3. **Enter'a basın**
4. ✅ **Siteniz açıldı!**

## 6.2 Backend'i Test Edin

1. **Yeni sekme açın**
2. **Adres çubuğuna yazın:** `localhost:5000/api/test`
3. **Enter'a basın**
4. **Şöyle bir yazı göreceksiniz:**
   ```json
   {
     "mesaj": "Backend çalışıyor!",
     "tarih": "19.11.2024 14:30:45"
   }
   ```

---

# 🔴 SORUN GİDERME

## SORUN 1: "npm tanımlı değil" hatası
**ÇÖZÜM:** Node.js kurulmamış. ADIM 1'e geri dönün.

## SORUN 2: "Port 5000 kullanımda" hatası
**ÇÖZÜM:** 
1. Ctrl + C basın (mevcut server'ı kapat)
2. Tekrar `node server-basit.js` yazın

## SORUN 3: "Cannot find module" hatası
**ÇÖZÜM:**
1. `npm install` yazın → Enter
2. Bekleyin
3. Tekrar deneyin

## SORUN 4: Site açılmıyor
**ÇÖZÜM:**
1. Server çalışıyor mu kontrol edin
2. localhost:5000 yazdığınızdan emin olun
3. Firewall/antivirüs kapatın

---

# 📊 VERİTABANI KURULUMU (Opsiyonel)

## SQLite Veritabanı (En Basit)

### database-setup.js dosyası oluşturun:

```javascript
const sqlite3 = require('sqlite3').verbose();

// Veritabanı oluştur
const db = new sqlite3.Database('arsarazi.db');

// Tabloları oluştur
db.serialize(() => {
    // Gayrimenkuller tablosu
    db.run(`CREATE TABLE IF NOT EXISTS gayrimenkuller (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baslik TEXT,
        fiyat REAL,
        alan REAL,
        konum TEXT,
        durum TEXT,
        tarih DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Müşteriler tablosu
    db.run(`CREATE TABLE IF NOT EXISTS musteriler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT,
        telefon TEXT,
        email TEXT,
        tip TEXT,
        tarih DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ Veritabanı tabloları oluşturuldu!');
});

db.close();
```

**Çalıştırmak için:**
```
node database-setup.js
```

---

# 🎯 ÖZET - NE YAPTIK?

1. ✅ Node.js kurduk (JavaScript çalıştırıcı)
2. ✅ Gerekli paketleri yükledik (express, cors, sqlite3)
3. ✅ Basit bir server oluşturduk
4. ✅ Server'ı çalıştırdık
5. ✅ Test ettik ve çalıştığını gördük

---

# 🚀 SONRAKİ ADIMLAR

1. **Hosting'e yükleme** (Ücretsiz: Render.com, Railway.app)
2. **Domain bağlama** (arsarazi.com gibi)
3. **SSL sertifikası** (https:// için)
4. **Yedekleme sistemi**

---

# 💡 İPUCU

Her değişiklik yaptığınızda:
1. Ctrl + C (server'ı durdur)
2. `node server-basit.js` (tekrar başlat)

---

# 📞 YARDIM

Takıldığınız yerde:
- YouTube: "Node.js kurulumu türkçe"
- ChatGPT'ye sorun
- Bir yazılımcı arkadaşınızdan yardım alın

---

**TEBRİKLER! 🎉**
Backend'iniz çalışıyor. Artık verileriniz güvende ve siteniz dinamik!