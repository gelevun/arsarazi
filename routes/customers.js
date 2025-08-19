const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { authMiddleware, agentMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const customerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().min(10).max(50).required(),
  type: Joi.string().valid('Alıcı', 'Satıcı', 'Yatırımcı', 'Potansiyel Alıcı', 'Potansiyel Satıcı').required(),
  status: Joi.string().valid('Aktif', 'Pasif', 'Yeni', 'Dönüştürüldü').default('Aktif'),
  interests: Joi.array().items(Joi.string()).default([]),
  budget_min: Joi.number().min(0).optional(),
  budget_max: Joi.number().min(0).optional(),
  notes: Joi.string().max(2000).optional().allow(''),
  source: Joi.string().max(100).default('Web Sitesi')
});

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private (Agent/Admin)
router.get('/', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, status } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get customers
    const result = await query(
      `SELECT c.*, u.name as assigned_agent_name 
       FROM customers c
       LEFT JOIN users u ON c.assigned_agent = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    res.json({
      success: true,
      data: {
        customers: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private (Agent/Admin)
router.post('/', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, type, status, interests, budget_min, budget_max, notes, source, assigned_agent, last_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        value.name, value.email || null, value.phone, value.type, value.status,
        JSON.stringify(value.interests), value.budget_min, value.budget_max,
        value.notes, value.source, req.user.userId
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Müşteri başarıyla eklendi',
      data: {
        customer: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (Agent/Admin)
router.put('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const result = await query(
      `UPDATE customers SET 
        name = $1, email = $2, phone = $3, type = $4, status = $5,
        interests = $6, budget_min = $7, budget_max = $8, notes = $9
       WHERE id = $10
       RETURNING *`,
      [
        value.name, value.email || null, value.phone, value.type, value.status,
        JSON.stringify(value.interests), value.budget_min, value.budget_max,
        value.notes, customerId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Müşteri başarıyla güncellendi',
      data: {
        customer: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (Agent/Admin)
router.delete('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [customerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;