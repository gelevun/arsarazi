const bcrypt = require('bcryptjs');
const { query, testConnection, closePool } = require('../config/database');

// Seed database with initial data
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      process.exit(1);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Admin User', 'admin@arsarazi.com', adminPassword, 'admin']
    );

    let adminId = adminResult.rows[0]?.id;
    if (!adminId) {
      const existingAdmin = await query('SELECT id FROM users WHERE email = $1', ['admin@arsarazi.com']);
      adminId = existingAdmin.rows[0]?.id;
    }

    // Create sample properties
    console.log('🏠 Creating sample properties...');
    const properties = [
      {
        title: "Karesi Merkez Konut Arsası",
        slug: "karesi-merkez-konut-arsasi",
        location: "Karesi Merkez, Balıkesir",
        address: "Paşa Alanı Mahallesi, Balıkesir",
        area: 2000,
        price: 450000,
        type: "Konut",
        status: "Satılık",
        description: "Karesi merkez konumunda, imar durumu uygun, yatırım potansiyeli yüksek arsa.",
        features: ["Merkezi Konum", "İmar Uygun", "Ulaşım Kolay", "Yatırım Fırsatı"],
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop"],
        zoning: "Konut Alanı",
        investment_potential: "Yüksek",
        contact_person: "Ahmet Balıkesir",
        contact_phone: "+90 532 123 4567",
        is_featured: true
      },
      {
        title: "Paşa Alanı Villa Arsası",
        slug: "pasa-alani-villa-arsasi",
        location: "Paşa Alanı, Karesi",
        address: "Paşa Alanı Mahallesi, Karesi, Balıkesir",
        area: 1500,
        price: 380000,
        type: "Villa",
        status: "Satılık",
        description: "Villa yapımına uygun, sessiz ve sakin çevrede, doğayla iç içe arsa.",
        features: ["Doğal Çevre", "Villa İmarlı", "Sessiz Lokasyon", "Temiz Hava"],
        images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop"],
        zoning: "Villa Alanı",
        investment_potential: "Yüksek",
        contact_person: "Ayşe Karesi",
        contact_phone: "+90 533 234 5678",
        is_featured: true
      },
      {
        title: "Balıkesir OSB Sanayi Arsası",
        slug: "balikesir-osb-sanayi-arsasi",
        location: "Organize Sanayi, Balıkesir",
        address: "OSB 1. Kısım, Balıkesir",
        area: 4000,
        price: 800000,
        type: "Sanayi",
        status: "Satılık",
        description: "Organize sanayi bölgesinde, fabrika kurulumu için ideal, ana yola cepheli.",
        features: ["OSB İçinde", "Sanayi İmarlı", "Elektrik Var", "Su Var"],
        images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"],
        zoning: "Sanayi Alanı",
        investment_potential: "Çok Yüksek",
        contact_person: "Mehmet Sanayi",
        contact_phone: "+90 534 345 6789",
        is_featured: true
      }
    ];

    for (const property of properties) {
      await query(
        `INSERT INTO properties (
          title, slug, location, address, area, price, type, status, description,
          features, images, zoning, investment_potential, contact_person, 
          contact_phone, is_featured, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (slug) DO NOTHING`,
        [
          property.title, property.slug, property.location, property.address, property.area, 
          property.price, property.type, property.status, property.description,
          JSON.stringify(property.features), JSON.stringify(property.images), 
          property.zoning, property.investment_potential, property.contact_person, 
          property.contact_phone, property.is_featured, adminId
        ]
      );
    }

    // Create sample customers
    console.log('👥 Creating sample customers...');
    const customers = [
      {
        name: "Emre Balıkesir",
        email: "emre@example.com",
        phone: "+90 532 111 2233",
        type: "Alıcı",
        status: "Aktif",
        interests: ["Konut arsası", "Karesi"],
        budget_min: 300000,
        budget_max: 600000,
        notes: "Karesi merkezde konut arsası arıyor"
      },
      {
        name: "Zeynep Gönen",
        email: "zeynep@example.com",
        phone: "+90 533 222 3344",
        type: "Yatırımcı",
        status: "Aktif",
        interests: ["Sanayi arsası", "OSB"],
        budget_min: 500000,
        budget_max: 1200000,
        notes: "OSB'de sanayi arsası arıyor"
      }
    ];

    for (const customer of customers) {
      await query(
        `INSERT INTO customers (name, email, phone, type, status, interests, budget_min, budget_max, notes, assigned_agent, last_contact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [
          customer.name, customer.email, customer.phone, customer.type, customer.status,
          JSON.stringify(customer.interests), customer.budget_min, customer.budget_max,
          customer.notes, adminId
        ]
      );
    }

    // Create sample blog posts
    console.log('📝 Creating sample blog posts...');
    const blogPosts = [
      {
        title: "Balıkesir'de Arsa Yatırımı Rehberi",
        slug: "balikesir-arsa-yatirim-rehberi",
        summary: "Balıkesir ve çevresinde arsa yatırımında dikkat edilmesi gereken önemli faktörler.",
        content: "Balıkesir'de arsa yatırımı yaparken dikkat edilecek önemli faktörler hakkında detaylı rehber...",
        category: "Yatırım Rehberi",
        tags: ["balıkesir", "yatırım", "arsa", "rehber"],
        featured_image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
        is_published: true
      },
      {
        title: "Karesi Bölgesi İmar Planları",
        slug: "karesi-bolgesi-imar-planlari",
        summary: "Karesi bölgesindeki imar planları ve arsa değerlerine etkisi.",
        content: "Karesi bölgesinde imar planları arsa değerini nasıl etkiler, detaylı analiz...",
        category: "İmar ve Planlama",
        tags: ["karesi", "imar", "planlama", "değer"],
        featured_image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop",
        is_published: true
      }
    ];

    for (const post of blogPosts) {
      await query(
        `INSERT INTO blog_posts (title, slug, summary, content, author_id, category, tags, featured_image, is_published, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         ON CONFLICT (slug) DO NOTHING`,
        [
          post.title, post.slug, post.summary, post.content, adminId,
          post.category, JSON.stringify(post.tags), post.featured_image, post.is_published
        ]
      );
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('👤 Admin user: admin@arsarazi.com / admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };