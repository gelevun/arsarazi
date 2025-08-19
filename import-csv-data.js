const fs = require('fs');
const path = require('path');

// CSV dosyasını oku
function readCSVFile() {
    try {
        const csvPath = path.join(__dirname, 'ARSARAZİ PORTFÖY GENEL 3df61ecffbda4589b2bafc1cc05e2727_all.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        
        // CSV satırlarını ayır
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        // Başlık satırını al
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Veri satırlarını işle
        const properties = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // CSV parsing - tırnak içindeki virgülleri koru
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim()); // Son değeri ekle
            
            if (values.length >= headers.length) {
                const property = {};
                
                headers.forEach((header, index) => {
                    property[header] = values[index] || '';
                });
                
                // ID oluştur
                property.id = `GM-${property['İLAN NO.'] || Date.now()}-${i}`;
                
                // Fiyatı sayıya çevir
                const fiyatStr = property['FİYAT(Gr. Altın)'] || '0';
                property.fiyat = parseFloat(fiyatStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                
                // Alanı sayıya çevir
                const alanStr = property['M²'] || '0';
                property.alan = parseFloat(alanStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                
                // Durumu kontrol et
                property.durum = property['DURUM'] === 'SATIŞTA' ? 'Satılık' : 'Aktif';
                
                // Tarih formatını düzelt
                const tarihStr = property['İLAN TARİHİ'] || '';
                try {
                    property.tarih = tarihStr ? new Date(tarihStr).toISOString() : new Date().toISOString();
                } catch (error) {
                    property.tarih = new Date().toISOString();
                }
                
                // Ek bilgiler
                property.tip = property['NİTELİK'] || 'Arsa';
                property.konum = `${property['İL'] || ''} ${property['İLÇE'] || ''} ${property['MAHALLE'] || ''}`.trim();
                property.aciklama = property['AÇIKLAMA'] || '';
                property.imar_durumu = property['İMAR DURUMU'] || '';
                property.ada = property['ADA'] || '';
                property.parsel = property['PARSEL'] || '';
                property.hisse_turu = property['HİSSE TÜRÜ'] || '';
                
                properties.push(property);
            }
        }
        
        return properties;
    } catch (error) {
        console.error('CSV okuma hatası:', error);
        return [];
    }
}

// Database.json'u güncelle
function updateDatabase(properties) {
    try {
        const dbPath = path.join(__dirname, 'database.json');
        let db = {};
        
        // Mevcut database'i oku
        if (fs.existsSync(dbPath)) {
            const dbContent = fs.readFileSync(dbPath, 'utf8');
            db = JSON.parse(dbContent);
        }
        
        // Gayrimenkulleri güncelle
        db.gayrimenkuller = properties;
        
        // Database'i yaz
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        console.log(`✅ ${properties.length} gayrimenkul verisi database.json'a eklendi`);
        return true;
    } catch (error) {
        console.error('Database güncelleme hatası:', error);
        return false;
    }
}

// İstatistikleri hesapla
function calculateStatistics(properties) {
    const totalProperties = properties.length;
    const satilikProperties = properties.filter(p => p.durum === 'Satılık').length;
    const aktifProperties = properties.filter(p => p.durum === 'Aktif').length;
    
    const totalValue = properties.reduce((sum, p) => sum + (p.fiyat || 0), 0);
    const satilikValue = properties
        .filter(p => p.durum === 'Satılık')
        .reduce((sum, p) => sum + (p.fiyat || 0), 0);
    
    const totalArea = properties.reduce((sum, p) => sum + (p.alan || 0), 0);
    
    // Tip dağılımı
    const typeDistribution = {};
    properties.forEach(p => {
        const tip = p.tip || 'Diğer';
        typeDistribution[tip] = (typeDistribution[tip] || 0) + 1;
    });
    
    // İl dağılımı
    const cityDistribution = {};
    properties.forEach(p => {
        const il = p.konum.split(' ')[0] || 'Bilinmiyor';
        cityDistribution[il] = (cityDistribution[il] || 0) + 1;
    });
    
    console.log('\n📊 PORTFÖY İSTATİSTİKLERİ:');
    console.log('========================');
    console.log(`🏠 Toplam Gayrimenkul: ${totalProperties}`);
    console.log(`💰 Toplam Değer: ₺${totalValue.toLocaleString()}`);
    console.log(`📏 Toplam Alan: ${totalArea.toLocaleString()} m²`);
    console.log(`🟢 Satılık: ${satilikProperties}`);
    console.log(`🔵 Aktif: ${aktifProperties}`);
    
    console.log('\n📈 TİP DAĞILIMI:');
    Object.entries(typeDistribution).forEach(([tip, sayi]) => {
        console.log(`   ${tip}: ${sayi} adet`);
    });
    
    console.log('\n🏙️ İL DAĞILIMI:');
    Object.entries(cityDistribution).forEach(([il, sayi]) => {
        console.log(`   ${il}: ${sayi} adet`);
    });
    
    return {
        toplam_gayrimenkul: totalProperties,
        satilik_gayrimenkul: satilikProperties,
        aktif_gayrimenkul: aktifProperties,
        toplam_deger: totalValue,
        satilik_deger: satilikValue,
        toplam_alan: totalArea,
        tip_dagilimi: typeDistribution,
        il_dagilimi: cityDistribution
    };
}

// Ana fonksiyon
function main() {
    console.log('🔄 CSV verilerini işleniyor...');
    
    // CSV'yi oku
    const properties = readCSVFile();
    
    if (properties.length === 0) {
        console.log('❌ CSV verisi okunamadı');
        return;
    }
    
    console.log(`📁 ${properties.length} gayrimenkul verisi okundu`);
    
    // İstatistikleri hesapla
    const stats = calculateStatistics(properties);
    
    // Database'i güncelle
    const success = updateDatabase(properties);
    
    if (success) {
        console.log('\n✅ İşlem tamamlandı!');
        console.log('🚀 Dashboard\'ı yenileyerek gerçek verileri görebilirsiniz.');
    } else {
        console.log('\n❌ Database güncellenirken hata oluştu');
    }
}

// Scripti çalıştır
main();
