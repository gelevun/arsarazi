// ARSARAZI - EN BASİT BACKEND
// Çalıştırmak için: node backend-basit.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

// Basit veri deposu (dosya yoksa oluştur)
const dataFile = 'veriler.json';
if (!fs.existsSync(dataFile)) {
    const baslangicVerisi = {
        gayrimenkuller: [
            {
                id: 1,
                baslik: "Karesi Merkez Arsa",
                fiyat: 1250000,
                alan: 2500,
                durum: "Satılık"
            },
            {
                id: 2,
                baslik: "Bandırma Villa",
                fiyat: 3500000,
                alan: 450,
                durum: "Satılık"
            }
        ],
        musteriler: [
            {
                id: 1,
                ad: "Ahmet Yılmaz",
                telefon: "0532 123 45 67",
                tip: "Yatırımcı"
            }
        ]
    };
    fs.writeFileSync(dataFile, JSON.stringify(baslangicVerisi, null, 2));
}

// Server oluştur
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers (her şeye izin ver)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Ana sayfa
    if (pathname === '/' || pathname === '/index.html') {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(fs.readFileSync(indexPath));
        } else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Arsarazi Backend</title>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            max-width: 800px;
                            margin: 50px auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #52B947 0%, #0B5394 100%);
                            min-height: 100vh;
                        }
                        .container {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        }
                        h1 { color: #0B5394; }
                        .status { 
                            color: #52B947; 
                            font-size: 24px; 
                            margin: 20px 0;
                        }
                        .endpoint {
                            background: #f5f5f5;
                            padding: 10px;
                            margin: 10px 0;
                            border-radius: 5px;
                            font-family: monospace;
                        }
                        a {
                            color: #0B5394;
                            text-decoration: none;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🏠 Arsarazi Backend Sistemi</h1>
                        <div class="status">✅ Sistem Aktif ve Çalışıyor!</div>
                        
                        <h2>📊 Sistem Bilgileri:</h2>
                        <p><strong>Port:</strong> ${PORT}</p>
                        <p><strong>Durum:</strong> Çalışıyor</p>
                        <p><strong>Saat:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                        
                        <h2>🔌 API Endpoints:</h2>
                        <div class="endpoint">
                            <a href="/api/test" target="_blank">GET /api/test</a> - API Testi
                        </div>
                        <div class="endpoint">
                            <a href="/api/gayrimenkuller" target="_blank">GET /api/gayrimenkuller</a> - Tüm Gayrimenkuller
                        </div>
                        <div class="endpoint">
                            <a href="/api/musteriler" target="_blank">GET /api/musteriler</a> - Tüm Müşteriler
                        </div>
                        
                        <h2>💾 Veri Dosyası:</h2>
                        <p>veriler.json (${fs.existsSync(dataFile) ? 'Mevcut' : 'Yok'})</p>
                        
                        <h2>🛠️ Kullanım:</h2>
                        <ol>
                            <li>API endpoints'lere tıklayarak verileri görüntüleyebilirsiniz</li>
                            <li>CRM Dashboard'a gitmek için: <a href="/dashboard.html">Dashboard</a></li>
                            <li>Ana siteye gitmek için: <a href="/index.html">Ana Sayfa</a></li>
                        </ol>
                    </div>
                </body>
                </html>
            `);
        }
        return;
    }

    // API Test
    if (pathname === '/api/test') {
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({
            durum: 'Başarılı',
            mesaj: 'API çalışıyor!',
            tarih: new Date().toLocaleString('tr-TR')
        }, null, 2));
        return;
    }

    // Gayrimenkuller API
    if (pathname === '/api/gayrimenkuller') {
        const data = JSON.parse(fs.readFileSync(dataFile));
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({
            durum: 'Başarılı',
            toplam: data.gayrimenkuller.length,
            veri: data.gayrimenkuller
        }, null, 2));
        return;
    }

    // Müşteriler API
    if (pathname === '/api/musteriler') {
        const data = JSON.parse(fs.readFileSync(dataFile));
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({
            durum: 'Başarılı',
            toplam: data.musteriler.length,
            veri: data.musteriler
        }, null, 2));
        return;
    }

    // Diğer HTML dosyaları
    if (pathname.endsWith('.html')) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(fs.readFileSync(filePath));
            return;
        }
    }

    // CSS dosyaları
    if (pathname.endsWith('.css')) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(fs.readFileSync(filePath));
            return;
        }
    }

    // JS dosyaları
    if (pathname.endsWith('.js')) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(fs.readFileSync(filePath));
            return;
        }
    }

    // Resim dosyaları
    if (pathname.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(pathname).slice(1);
            const contentType = ext === 'ico' ? 'image/x-icon' : `image/${ext}`;
            res.writeHead(200, {'Content-Type': contentType});
            res.end(fs.readFileSync(filePath));
            return;
        }
    }

    // 404 - Bulunamadı
    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Sayfa Bulunamadı</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                }
                .error-container {
                    text-align: center;
                    padding: 40px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                h1 { color: #e74c3c; }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>404</h1>
                <h2>Sayfa Bulunamadı</h2>
                <p>Aradığınız sayfa: ${pathname}</p>
                <a href="/">Ana Sayfaya Dön</a>
            </div>
        </body>
        </html>
    `);
});

// Server'ı başlat
server.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(' '.repeat(15) + '🚀 ARSARAZI BACKEND ÇALIŞIYOR!');
    console.log('='.repeat(60));
    console.log('\n📌 ADRESLER:');
    console.log(`   🌐 Ana Sayfa:     http://localhost:${PORT}`);
    console.log(`   📊 Dashboard:     http://localhost:${PORT}/dashboard.html`);
    console.log(`   🔌 API Test:      http://localhost:${PORT}/api/test`);
    console.log(`   🏠 Gayrimenkuller: http://localhost:${PORT}/api/gayrimenkuller`);
    console.log(`   👥 Müşteriler:    http://localhost:${PORT}/api/musteriler`);
    console.log('\n💾 Veriler "veriler.json" dosyasında saklanıyor');
    console.log('\n🔴 Durdurmak için: Ctrl + C (Windows) veya Control + C (Mac)\n');
    console.log('='.repeat(60) + '\n');
});

// Hata yakalama
process.on('uncaughtException', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ HATA: Port ${PORT} kullanımda!\n`);
        console.log('ÇÖZÜM 1: Başka bir port deneyin (örn: 5001)');
        console.log('ÇÖZÜM 2: Mevcut işlemi durdurun:\n');
        console.log('Windows: netstat -ano | findstr :5000');
        console.log('         taskkill /PID [PID_NUMARASI] /F\n');
        console.log('Mac:     lsof -i :5000');
        console.log('         kill -9 [PID_NUMARASI]\n');
    } else {
        console.error('❌ HATA:', err.message);
    }
    process.exit(1);
});