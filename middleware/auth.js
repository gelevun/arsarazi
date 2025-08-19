const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Erişim engellendi. Token bulunamadı.'
      });
    }

    // Check if Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token formatı'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const result = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Hesap devre dışı'
      });
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Admin role middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Erişim engellendi. Admin yetkisi gerekli.'
    });
  }
  next();
};

// Agent or admin middleware
const agentMiddleware = (req, res, next) => {
  if (!['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Erişim engellendi. Danışman veya admin yetkisi gerekli.'
    });
  }
  next();
};

// Optional auth middleware (doesn't throw error if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      const user = result.rows[0];
      req.user = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }

    next();

  } catch (error) {
    // Ignore token errors in optional middleware
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  agentMiddleware,
  optionalAuthMiddleware
};