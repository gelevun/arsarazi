/**
 * SQLite Database Configuration - No Installation Required!
 * Bu dosya otomatik olarak SQLite veritabanı oluşturur ve yönetir
 */

const path = require('path');
const fs = require('fs').promises;

class SQLiteManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/arsarazi.sqlite');
    this.dataDir = path.join(__dirname, '../data');
    this.db = null;
  }

  // SQLite kurulu mu kontrol et, yoksa portable version indir
  async ensureSQLite() {
    try {
      // Better-sqlite3 kullan (native SQLite, kurulum gerektirmez)
      const Database = require('better-sqlite3');
      return Database;
    } catch (error) {
      console.log('📦 SQLite modülü yükleniyor...');
      // Eğer modül yoksa, basit dosya tabanlı sistem kullan
      return null;
    }
  }

  // Veritabanı klasörünü oluştur
  async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 Veritabanı klasörü oluşturuldu:', this.dataDir);
    }
  }

  // Veritabanını başlat
  async initialize() {
    await this.ensureDataDirectory();
    
    const Database = await this.ensureSQLite();
    if (!Database) {
      // Fallback: JSON file database
      return this.initializeJSONDatabase();
    }

    try {
      this.db = new Database(this.dbPath);
      console.log('✅ SQLite veritabanı bağlandı:', this.dbPath);
      
      // Performans optimizasyonları
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('temp_store = MEMORY');
      
      await this.createTables();
      await this.seedInitialData();
      
      return this.db;
    } catch (error) {
      console.error('❌ SQLite hatası:', error);
      return this.initializeJSONDatabase();
    }
  }

  // JSON tabanlı basit veritabanı (fallback)
  async initializeJSONDatabase() {
    console.log('📄 JSON tabanlı veritabanı kullanılıyor...');
    
    const jsonDbPath = path.join(this.dataDir, 'arsarazi.json');
    
    try {
      await fs.access(jsonDbPath);
      const data = await fs.readFile(jsonDbPath, 'utf8');
      this.jsonDb = JSON.parse(data);
    } catch {
      this.jsonDb = {
        users: [],
        properties: [],
        customers: [],
        contacts: [],
        blog_posts: [],
        settings: {}
      };
      await this.saveJSONDatabase();
    }
    
    console.log('✅ JSON veritabanı hazır');
    return this.jsonDb;
  }

  // JSON veritabanını kaydet
  async saveJSONDatabase() {
    const jsonDbPath = path.join(this.dataDir, 'arsarazi.json');
    await fs.writeFile(jsonDbPath, JSON.stringify(this.jsonDb, null, 2));
  }

  // SQLite tabloları oluştur
  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Properties table
      `CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        price REAL NOT NULL,
        area REAL,
        location TEXT,
        address TEXT,
        features TEXT,
        images TEXT,
        contact_info TEXT,
        is_featured BOOLEAN DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Contact submissions table
      `CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Blog posts table
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        status TEXT DEFAULT 'published',
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )`
    ];

    for (const tableSQL of tables) {
      this.db.exec(tableSQL);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type)',
      'CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)',
      'CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status)'
    ];

    for (const indexSQL of indexes) {
      this.db.exec(indexSQL);
    }

    console.log('✅ Veritabanı tabloları oluşturuldu');
  }

  // İlk verileri yükle
  async seedInitialData() {
    // Admin kullanıcısı var mı kontrol et
    const existingAdmin = this.db.prepare('SELECT id FROM users WHERE email = ?').get('admin@arsarazi.com');
    
    if (!existingAdmin) {
      // Admin kullanıcısı oluştur
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      this.db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run('Admin User', 'admin@arsarazi.com', hashedPassword, 'admin');

      console.log('👤 Admin kullanıcısı oluşturuldu: admin@arsarazi.com / admin123');
    }

    // Örnek emlaklar var mı kontrol et
    const existingProperties = this.db.prepare('SELECT COUNT(*) as count FROM properties').get();
    
    if (existingProperties.count === 0) {
      const sampleProperties = [
        {
          title: 'Karesi Merkez Konut Arsası',
          description: 'Karesi merkezde, ana yola cepheli, imar durumu temiz konut arsası. Tüm belediye hizmetleri mevcut.',
          type: 'Konut',
          status: 'Satılık',
          price: 450000,
          area: 2000,
          location: 'Karesi Merkez, Balıkesir',
          address: 'Karesi Merkez Mahallesi, Balıkesir',
          features: JSON.stringify(['Ana yola cepheli', 'İmar durumu temiz', 'Elektrik var', 'Su var', 'Doğalgaz var']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop']),
          is_featured: 1
        },
        {
          title: 'Paşa Alanı Villa Arsası',
          description: 'Paşa Alanı bölgesinde, sakin bir çevrede villa arsası. Denize yakın konumda.',
          type: 'Villa',
          status: 'Satılık',
          price: 380000,
          area: 1500,
          location: 'Paşa Alanı, Karesi',
          address: 'Paşa Alanı Mahallesi, Karesi/Balıkesir',
          features: JSON.stringify(['Sakin çevre', 'Denize yakın', 'Villa için ideal', 'Elektrik var', 'Su var']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop']),
          is_featured: 1
        },
        {
          title: 'Balıkesir OSB Sanayi Arsası',
          description: 'Organize Sanayi Bölgesinde, sanayi yatırımları için uygun arsa. Altyapısı hazır.',
          type: 'Sanayi',
          status: 'Satılık',
          price: 800000,
          area: 4000,
          location: 'Organize Sanayi, Balıkesir',
          address: 'Balıkesir OSB, Balıkesir',
          features: JSON.stringify(['OSB içinde', 'Altyapı hazır', 'Sanayi için uygun', 'Elektrik var', 'Su var', 'Doğalgaz var']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop']),
          is_featured: 0
        }
      ];

      const insertProperty = this.db.prepare(`
        INSERT INTO properties (title, description, type, status, price, area, location, address, features, images, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const property of sampleProperties) {
        insertProperty.run(
          property.title, property.description, property.type, property.status,
          property.price, property.area, property.location, property.address,
          property.features, property.images, property.is_featured
        );
      }

      console.log('🏠 Örnek emlaklar eklendi');
    }

    // Örnek blog yazısı
    const existingPosts = this.db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
    if (existingPosts.count === 0) {
      this.db.prepare(`
        INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, author_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'Balıkesir\'de Gayrimenkul Yatırımı',
        'balikesir-gayrimenkul-yatirim',
        'Balıkesir, Türkiye\'nin en gelişmekte olan şehirlerinden biri. Özellikle arsa yatırımı açısından büyük fırsatlar sunuyor...',
        'Balıkesir gayrimenkul piyasasında yatırım fırsatları hakkında bilmeniz gerekenler.',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
        1
      );

      console.log('📝 Örnek blog yazısı eklendi');
    }
  }

  // Query çalıştır
  query(sql, params = []) {
    if (this.db) {
      try {
        if (sql.toLowerCase().startsWith('select')) {
          return this.db.prepare(sql).all(params);
        } else {
          return this.db.prepare(sql).run(params);
        }
      } catch (error) {
        console.error('Database query error:', error);
        throw error;
      }
    } else {
      // JSON database fallback
      console.log('Using JSON database fallback for query:', sql);
      return [];
    }
  }

  // Veritabanını kapat
  close() {
    if (this.db) {
      this.db.close();
      console.log('🔒 Veritabanı bağlantısı kapatıldı');
    }
  }
}

// Global instance
const dbManager = new SQLiteManager();

module.exports = {
  dbManager,
  initialize: () => dbManager.initialize(),
  query: (sql, params) => dbManager.query(sql, params),
  close: () => dbManager.close()
};