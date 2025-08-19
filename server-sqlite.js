const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Database
const { initialize: initializeDatabase } = require('./config/sqlite-database');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and start server
async function startServer() {
  try {
    console.log('🗄️ Veritabanı başlatılıyor...');
    await initializeDatabase();
    console.log('✅ Veritabanı hazır!');

    // API Routes (SQLite versions)
    app.use('/api/auth', require('./routes/sqlite-auth'));
    app.use('/api/properties', require('./routes/sqlite-properties'));
    app.use('/api/contact', require('./routes/sqlite-contact'));

    // Health check endpoint
    app.get('/api/health', async (req, res) => {
      try {
        // Test database connection
        const { query } = require('./config/sqlite-database');
        const result = query('SELECT 1 as test');
        
        res.json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: 'SQLite',
          database_status: result.length > 0 ? 'Connected' : 'Error'
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          database: 'SQLite',
          database_status: 'Disconnected',
          error: error.message
        });
      }
    });

    // Database management endpoints (Admin only)
    app.get('/api/admin/database/status', async (req, res) => {
      try {
        const { query } = require('./config/sqlite-database');
        
        // Get table counts
        const tables = ['users', 'properties', 'customers', 'contact_submissions', 'blog_posts'];
        const stats = {};
        
        for (const table of tables) {
          try {
            const result = query(`SELECT COUNT(*) as count FROM ${table}`);
            stats[table] = result[0]?.count || 0;
          } catch {
            stats[table] = 0;
          }
        }
        
        res.json({
          success: true,
          data: {
            database_type: 'SQLite',
            database_path: './data/arsarazi.sqlite',
            table_stats: stats,
            total_records: Object.values(stats).reduce((sum, count) => sum + count, 0)
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Database status error',
          error: error.message
        });
      }
    });

    // Serve frontend for all non-api routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal Server Error',
          status: err.status || 500,
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
      });
    });

    // 404 handler for API routes
    app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: {
          message: 'API endpoint not found',
          status: 404
        }
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Arsarazi Backend Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
      console.log(`🗄️ Database: SQLite (./data/arsarazi.sqlite)`);
      console.log(`👤 Admin Login: admin@arsarazi.com / admin123`);
      console.log(`🔧 Database Manager: node database-manager.js`);
    });

  } catch (error) {
    console.error('❌ Server başlatma hatası:', error);
    console.log('\n🔧 Çözüm önerileri:');
    console.log('1. Veritabanını kurun: node setup-database.js');
    console.log('2. Gerekli modülleri yükleyin: npm install');
    console.log('3. Port çakışması var mı kontrol edin');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Server kapatılıyor...');
  const { close } = require('./config/sqlite-database');
  close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Server kapatılıyor...');
  const { close } = require('./config/sqlite-database');
  close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;