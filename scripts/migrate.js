const { query, testConnection, closePool } = require('../config/database');

// Database schema migration
const createTables = async () => {
  console.log('🔨 Starting database migration...');

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      process.exit(1);
    }

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'agent')),
        phone VARCHAR(50),
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create properties table
    await query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        location VARCHAR(255) NOT NULL,
        address TEXT,
        area INTEGER NOT NULL CHECK (area > 0),
        price DECIMAL(15,2) NOT NULL CHECK (price > 0),
        price_per_m2 DECIMAL(10,2) GENERATED ALWAYS AS (price / area) STORED,
        type VARCHAR(100) NOT NULL CHECK (type IN ('Konut', 'Villa', 'Sanayi', 'Ticari', 'Tarım')),
        status VARCHAR(50) DEFAULT 'Satılık' CHECK (status IN ('Satılık', 'Satıldı', 'Rezerve', 'Pasif')),
        description TEXT,
        features JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        zoning VARCHAR(255),
        investment_potential VARCHAR(50) CHECK (investment_potential IN ('Çok Yüksek', 'Yüksek', 'Orta', 'Düşük')),
        contact_person VARCHAR(255),
        contact_phone VARCHAR(50),
        coordinates JSONB, -- {lat: 39.6484, lng: 27.8826}
        is_featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Properties table created');

    // Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL CHECK (type IN ('Alıcı', 'Satıcı', 'Yatırımcı', 'Potansiyel Alıcı', 'Potansiyel Satıcı')),
        status VARCHAR(50) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif', 'Yeni', 'Dönüştürüldü')),
        interests JSONB DEFAULT '[]',
        budget_min DECIMAL(15,2),
        budget_max DECIMAL(15,2),
        notes TEXT,
        source VARCHAR(100) DEFAULT 'Web Sitesi',
        assigned_agent INTEGER REFERENCES users(id),
        last_contact TIMESTAMP,
        next_followup TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Customers table created');

    // Create blog_posts table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        category VARCHAR(100) NOT NULL,
        tags JSONB DEFAULT '[]',
        featured_image VARCHAR(500),
        is_published BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Blog posts table created');

    // Create contact_submissions table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        property_id INTEGER REFERENCES properties(id),
        status VARCHAR(50) DEFAULT 'Yeni' CHECK (status IN ('Yeni', 'İnceleniyor', 'Yanıtlandı', 'Kapatıldı')),
        assigned_to INTEGER REFERENCES users(id),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contact submissions table created');

    // Create property_favorites table
    await query(`
      CREATE TABLE IF NOT EXISTS property_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, property_id)
      )
    `);
    console.log('✅ Property favorites table created');

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at)`);
    console.log('✅ Database indexes created');

    // Create updated_at trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tables = ['users', 'properties', 'customers', 'blog_posts'];
    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log('✅ Updated_at triggers created');

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables();
}

module.exports = { createTables };