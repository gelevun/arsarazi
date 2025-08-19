const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().min(10).max(50).required(),
  subject: Joi.string().max(255).required(),
  message: Joi.string().min(5).max(2000).required(),
  property_id: Joi.number().integer().optional()
});

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, property_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        value.name, value.email || null, value.phone, value.subject, 
        value.message, value.property_id || null, ipAddress, userAgent
      ]
    );

    // Also create customer record if phone doesn't exist
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE phone = $1',
      [value.phone]
    );

    if (existingCustomer.rows.length === 0) {
      await query(
        `INSERT INTO customers (name, email, phone, type, status, interests, notes, source, last_contact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          value.name, value.email || null, value.phone, 'Potansiyel Alıcı', 'Yeni',
          JSON.stringify([value.subject]), `İletişim formu: ${value.message}`,
          'İletişim Formu'
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.',
      data: {
        submission_id: result.rows[0].id
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'
    });
  }
});

module.exports = router;