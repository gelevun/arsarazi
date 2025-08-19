const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { authMiddleware, agentMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const propertySchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  location: Joi.string().min(3).max(255).required(),
  address: Joi.string().max(500).optional(),
  area: Joi.number().integer().min(1).required(),
  price: Joi.number().min(1).required(),
  type: Joi.string().valid('Konut', 'Villa', 'Sanayi', 'Ticari', 'Tarım').required(),
  status: Joi.string().valid('Satılık', 'Satıldı', 'Rezerve', 'Pasif').default('Satılık'),
  description: Joi.string().max(2000).optional(),
  features: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  zoning: Joi.string().max(255).optional(),
  investment_potential: Joi.string().valid('Çok Yüksek', 'Yüksek', 'Orta', 'Düşük').optional(),
  contact_person: Joi.string().max(255).optional(),
  contact_phone: Joi.string().max(50).optional(),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180)
  }).optional(),
  is_featured: Joi.boolean().default(false)
});

const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().max(255).optional(),
  type: Joi.string().valid('Konut', 'Villa', 'Sanayi', 'Ticari', 'Tarım').optional(),
  min_area: Joi.number().integer().min(1).optional(),
  max_price: Joi.number().min(1).optional(),
  investment_potential: Joi.string().valid('Çok Yüksek', 'Yüksek', 'Orta', 'Düşük').optional(),
  location: Joi.string().max(255).optional(),
  status: Joi.string().valid('Satılık', 'Satıldı', 'Rezerve', 'Pasif').default('Satılık'),
  sort: Joi.string().valid('newest', 'price-low', 'price-high', 'area-large', 'area-small').default('newest')
});

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      page,
      limit,
      search,
      type,
      min_area,
      max_price,
      investment_potential,
      location,
      status,
      sort
    } = value;

    // Build WHERE clause
    let whereConditions = ['status = $1'];
    let queryParams = [status];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR location ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (min_area) {
      whereConditions.push(`area >= $${paramIndex}`);
      queryParams.push(min_area);
      paramIndex++;
    }

    if (max_price) {
      whereConditions.push(`price <= $${paramIndex}`);
      queryParams.push(max_price);
      paramIndex++;
    }

    if (investment_potential) {
      whereConditions.push(`investment_potential = $${paramIndex}`);
      queryParams.push(investment_potential);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`location ILIKE $${paramIndex}`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    switch (sort) {
      case 'price-low':
        orderBy = 'price ASC';
        break;
      case 'price-high':
        orderBy = 'price DESC';
        break;
      case 'area-large':
        orderBy = 'area DESC';
        break;
      case 'area-small':
        orderBy = 'area ASC';
        break;
      default:
        orderBy = 'created_at DESC';
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM properties WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get properties
    const propertiesResult = await query(
      `SELECT p.*, u.name as created_by_name,
        CASE WHEN pf.property_id IS NOT NULL THEN true ELSE false END as is_favorited
       FROM properties p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN property_favorites pf ON p.id = pf.property_id AND pf.user_id = $${paramIndex}
       WHERE ${whereClause}
       ORDER BY is_featured DESC, ${orderBy}
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...queryParams, req.user?.userId || null, limit, offset]
    );

    const properties = propertiesResult.rows.map(property => ({
      ...property,
      features: property.features || [],
      images: property.images || [],
      coordinates: property.coordinates || null
    }));

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/properties/featured
// @desc    Get featured properties
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM properties 
       WHERE status = 'Satılık' AND is_featured = true 
       ORDER BY created_at DESC 
       LIMIT 6`
    );

    const properties = result.rows.map(property => ({
      ...property,
      features: property.features || [],
      images: property.images || []
    }));

    res.json({
      success: true,
      data: {
        properties
      }
    });

  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz property ID'
      });
    }

    // Increment view count
    await query(
      'UPDATE properties SET view_count = view_count + 1 WHERE id = $1',
      [propertyId]
    );

    // Get property with user info
    const result = await query(
      `SELECT p.*, u.name as created_by_name,
        CASE WHEN pf.property_id IS NOT NULL THEN true ELSE false END as is_favorited
       FROM properties p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN property_favorites pf ON p.id = pf.property_id AND pf.user_id = $2
       WHERE p.id = $1`,
      [propertyId, req.user?.userId || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Arsa bulunamadı'
      });
    }

    const property = {
      ...result.rows[0],
      features: result.rows[0].features || [],
      images: result.rows[0].images || [],
      coordinates: result.rows[0].coordinates || null
    };

    // Get related properties
    const relatedResult = await query(
      `SELECT id, title, location, area, price, images, type 
       FROM properties 
       WHERE id != $1 AND (type = $2 OR location ILIKE $3) AND status = 'Satılık'
       ORDER BY RANDOM() 
       LIMIT 3`,
      [propertyId, property.type, `%${property.location.split(',')[0]}%`]
    );

    const relatedProperties = relatedResult.rows.map(prop => ({
      ...prop,
      images: prop.images || []
    }));

    res.json({
      success: true,
      data: {
        property,
        related_properties: relatedProperties
      }
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Agent/Admin)
router.post('/', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    // Validate input
    const { error, value } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Generate slug
    const slug = generateSlug(value.title);
    
    // Check if slug exists
    const existingSlug = await query('SELECT id FROM properties WHERE slug = $1', [slug]);
    const finalSlug = existingSlug.rows.length > 0 ? `${slug}-${Date.now()}` : slug;

    // Insert property
    const result = await query(
      `INSERT INTO properties (
        title, slug, location, address, area, price, type, status, description,
        features, images, zoning, investment_potential, contact_person, 
        contact_phone, coordinates, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        value.title, finalSlug, value.location, value.address, value.area, value.price,
        value.type, value.status, value.description, JSON.stringify(value.features),
        JSON.stringify(value.images), value.zoning, value.investment_potential,
        value.contact_person, value.contact_phone, JSON.stringify(value.coordinates),
        value.is_featured, req.user.userId
      ]
    );

    const property = {
      ...result.rows[0],
      features: result.rows[0].features || [],
      images: result.rows[0].images || []
    };

    res.status(201).json({
      success: true,
      message: 'Arsa başarıyla eklendi',
      data: {
        property
      }
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Agent/Admin)
router.put('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Validate input
    const { error, value } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if property exists
    const existingProperty = await query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (existingProperty.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Arsa bulunamadı'
      });
    }

    // Update property
    const result = await query(
      `UPDATE properties SET 
        title = $1, location = $2, address = $3, area = $4, price = $5, type = $6, 
        status = $7, description = $8, features = $9, images = $10, zoning = $11,
        investment_potential = $12, contact_person = $13, contact_phone = $14,
        coordinates = $15, is_featured = $16
       WHERE id = $17
       RETURNING *`,
      [
        value.title, value.location, value.address, value.area, value.price, value.type,
        value.status, value.description, JSON.stringify(value.features),
        JSON.stringify(value.images), value.zoning, value.investment_potential,
        value.contact_person, value.contact_phone, JSON.stringify(value.coordinates),
        value.is_featured, propertyId
      ]
    );

    const property = {
      ...result.rows[0],
      features: result.rows[0].features || [],
      images: result.rows[0].images || []
    };

    res.json({
      success: true,
      message: 'Arsa başarıyla güncellendi',
      data: {
        property
      }
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Agent/Admin)
router.delete('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [propertyId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Arsa bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Arsa başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Toggle property favorite
// @access  Private
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Check if already favorited
    const existing = await query(
      'SELECT id FROM property_favorites WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existing.rows.length > 0) {
      // Remove from favorites
      await query(
        'DELETE FROM property_favorites WHERE user_id = $1 AND property_id = $2',
        [userId, propertyId]
      );
      
      res.json({
        success: true,
        message: 'Favorilerden kaldırıldı',
        data: { is_favorited: false }
      });
    } else {
      // Add to favorites
      await query(
        'INSERT INTO property_favorites (user_id, property_id) VALUES ($1, $2)',
        [userId, propertyId]
      );
      
      res.json({
        success: true,
        message: 'Favorilere eklendi',
        data: { is_favorited: true }
      });
    }

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;