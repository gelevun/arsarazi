const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { query } = require('../config/sqlite-database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'agent', 'user').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  current_password: Joi.string().optional(),
  new_password: Joi.string().min(6).max(100).optional()
});

// Helper Functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'arsarazi_default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Routes

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value: userData } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details
      });
    }

    // Check if user already exists
    const existingUsers = query('SELECT id FROM users WHERE email = ?', [userData.email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kayıtlı'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const result = query(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, [userData.name, userData.email, hashedPassword, userData.role]);

    // Get created user
    const newUsers = query('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
    const newUser = newUsers[0];

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: sanitizeUser(newUser),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt işlemi sırasında hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { error, value: loginData } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details
      });
    }

    // Find user
    const users = query('SELECT * FROM users WHERE email = ?', [loginData.email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: sanitizeUser(user),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş işlemi sırasında hata oluştu',
      error: error.message
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const users = query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user)
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { error, value: updateData } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details
      });
    }

    // Get current user
    const users = query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const currentUser = users[0];

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== currentUser.email) {
      const existingUsers = query('SELECT id FROM users WHERE email = ? AND id != ?', [updateData.email, req.user.id]);
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Bu email adresi zaten kullanılıyor'
        });
      }
    }

    // If password is being updated, verify current password
    if (updateData.new_password) {
      if (!updateData.current_password) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut şifre gerekli'
        });
      }

      const isValidPassword = await bcrypt.compare(updateData.current_password, currentUser.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut şifre yanlış'
        });
      }
    }

    // Prepare update data
    const updates = {};
    if (updateData.name) updates.name = updateData.name;
    if (updateData.email) updates.email = updateData.email;
    if (updateData.new_password) {
      updates.password = await bcrypt.hash(updateData.new_password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncellenecek veri bulunamadı'
      });
    }

    // Update user
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updates);
    
    query(`
      UPDATE users 
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [...updateValues, req.user.id]);

    // Get updated user
    const updatedUsers = query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const updatedUser = updatedUsers[0];

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        user: sanitizeUser(updatedUser)
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/auth/logout - User logout (client-side only)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

// GET /api/auth/users - Get all users (Admin only)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = query('SELECT COUNT(*) as total FROM users');
    const totalItems = totalResult[0]?.total || 0;

    // Get users
    const users = query(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / limit),
          has_next: page < Math.ceil(totalItems / limit),
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenirken hata oluştu',
      error: error.message
    });
  }
});

// DELETE /api/auth/users/:id - Delete user (Admin only)
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID'
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz'
      });
    }

    const result = query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;