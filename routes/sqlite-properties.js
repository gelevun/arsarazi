const express = require('express');
const Joi = require('joi');
const { query } = require('../config/sqlite-database');
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
  is_featured: Joi.boolean().default(false)
});

const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  search: Joi.string().max(255).optional(),
  type: Joi.string().valid('Konut', 'Villa', 'Sanayi', 'Ticari', 'Tarım').optional(),
  min_area: Joi.number().integer().min(1).optional(),
  max_price: Joi.number().min(1).optional(),
  location: Joi.string().max(255).optional(),
  status: Joi.string().valid('Satılık', 'Satıldı', 'Rezerve', 'Pasif').default('Satılık'),
  sort: Joi.string().valid('newest', 'price-low', 'price-high', 'area-large', 'area-small').default('newest')
});

// Helper Functions
const processPropertyData = (property) => {
  if (!property) return null;
  
  return {
    ...property,
    features: typeof property.features === 'string' ? JSON.parse(property.features || '[]') : property.features,
    images: typeof property.images === 'string' ? JSON.parse(property.images || '[]') : property.images,
    price_per_m2: property.area ? Math.round(property.price / property.area) : 0
  };
};

const buildWhereClause = (filters) => {
  const conditions = ['status = ?'];
  const params = [filters.status];

  if (filters.search) {
    conditions.push('(title LIKE ? OR location LIKE ? OR description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }

  if (filters.min_area) {
    conditions.push('area >= ?');
    params.push(filters.min_area);
  }

  if (filters.max_price) {
    conditions.push('price <= ?');
    params.push(filters.max_price);
  }

  if (filters.location) {
    conditions.push('location LIKE ?');
    params.push(`%${filters.location}%`);
  }

  return {
    where: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
};

const getOrderBy = (sort) => {
  switch (sort) {
    case 'price-low': return 'ORDER BY price ASC';
    case 'price-high': return 'ORDER BY price DESC';
    case 'area-large': return 'ORDER BY area DESC';
    case 'area-small': return 'ORDER BY area ASC';
    default: return 'ORDER BY created_at DESC';
  }
};

// Routes

// GET /api/properties - List all properties with filters
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { error, value: filters } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details
      });
    }

    const { where, params } = buildWhereClause(filters);
    const orderBy = getOrderBy(filters.sort);
    const offset = (filters.page - 1) * filters.limit;

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM properties ${where}`;
    const totalResult = query(countQuery, params);
    const totalItems = totalResult[0]?.total || 0;

    // Get properties
    const propertiesQuery = `
      SELECT * FROM properties 
      ${where} 
      ${orderBy} 
      LIMIT ? OFFSET ?
    `;
    const properties = query(propertiesQuery, [...params, filters.limit, offset]);

    const processedProperties = properties.map(processPropertyData);

    res.json({
      success: true,
      data: {
        properties: processedProperties,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / filters.limit),
          has_next: filters.page < Math.ceil(totalItems / filters.limit),
          has_prev: filters.page > 1
        }
      }
    });

  } catch (error) {
    console.error('Properties list error:', error);
    res.status(500).json({
      success: false,
      message: 'Emlaklar listelenirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/properties/featured - Get featured properties
router.get('/featured', async (req, res) => {
  try {
    const featuredProperties = query(
      'SELECT * FROM properties WHERE is_featured = 1 AND status = ? ORDER BY created_at DESC LIMIT 6',
      ['Satılık']
    );

    const processedProperties = featuredProperties.map(processPropertyData);

    res.json({
      success: true,
      data: {
        properties: processedProperties
      }
    });

  } catch (error) {
    console.error('Featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Öne çıkan emlaklar yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz emlak ID'
      });
    }

    // Get property
    const properties = query('SELECT * FROM properties WHERE id = ?', [propertyId]);
    const property = properties[0];

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Emlak bulunamadı'
      });
    }

    // Increment view count
    query('UPDATE properties SET view_count = view_count + 1 WHERE id = ?', [propertyId]);

    res.json({
      success: true,
      data: {
        property: processPropertyData(property)
      }
    });

  } catch (error) {
    console.error('Property detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Emlak detayları yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// POST /api/properties - Create new property (Admin only)
router.post('/', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const { error, value: propertyData } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details
      });
    }

    const insertQuery = `
      INSERT INTO properties (
        title, description, type, status, price, area, location, address,
        features, images, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = query(insertQuery, [
      propertyData.title,
      propertyData.description || '',
      propertyData.type,
      propertyData.status,
      propertyData.price,
      propertyData.area,
      propertyData.location,
      propertyData.address || '',
      JSON.stringify(propertyData.features),
      JSON.stringify(propertyData.images),
      propertyData.is_featured ? 1 : 0
    ]);

    // Get created property
    const newProperty = query('SELECT * FROM properties WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Emlak başarıyla eklendi',
      data: {
        property: processPropertyData(newProperty[0])
      }
    });

  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Emlak eklenirken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/properties/:id - Update property (Admin only)
router.put('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz emlak ID'
      });
    }

    const { error, value: propertyData } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details
      });
    }

    const updateQuery = `
      UPDATE properties SET
        title = ?, description = ?, type = ?, status = ?, price = ?,
        area = ?, location = ?, address = ?, features = ?, images = ?,
        is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = query(updateQuery, [
      propertyData.title,
      propertyData.description || '',
      propertyData.type,
      propertyData.status,
      propertyData.price,
      propertyData.area,
      propertyData.location,
      propertyData.address || '',
      JSON.stringify(propertyData.features),
      JSON.stringify(propertyData.images),
      propertyData.is_featured ? 1 : 0,
      propertyId
    ]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emlak bulunamadı'
      });
    }

    // Get updated property
    const updatedProperty = query('SELECT * FROM properties WHERE id = ?', [propertyId]);

    res.json({
      success: true,
      message: 'Emlak başarıyla güncellendi',
      data: {
        property: processPropertyData(updatedProperty[0])
      }
    });

  } catch (error) {
    console.error('Property update error:', error);
    res.status(500).json({
      success: false,
      message: 'Emlak güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// DELETE /api/properties/:id - Delete property (Admin only)
router.delete('/:id', authMiddleware, agentMiddleware, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz emlak ID'
      });
    }

    const result = query('DELETE FROM properties WHERE id = ?', [propertyId]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emlak bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Emlak başarıyla silindi'
    });

  } catch (error) {
    console.error('Property deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Emlak silinirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/properties/:id/similar - Get similar properties
router.get('/:id/similar', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz emlak ID'
      });
    }

    // Get current property type and location
    const currentProperty = query('SELECT type, location FROM properties WHERE id = ?', [propertyId]);
    
    if (currentProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emlak bulunamadı'
      });
    }

    const { type, location } = currentProperty[0];

    // Find similar properties
    const similarProperties = query(`
      SELECT * FROM properties 
      WHERE id != ? AND status = 'Satılık' 
      AND (type = ? OR location LIKE ?)
      ORDER BY 
        (CASE WHEN type = ? THEN 2 ELSE 0 END) +
        (CASE WHEN location LIKE ? THEN 1 ELSE 0 END) DESC,
        created_at DESC
      LIMIT 4
    `, [propertyId, type, `%${location}%`, type, `%${location}%`]);

    res.json({
      success: true,
      data: {
        properties: similarProperties.map(processPropertyData)
      }
    });

  } catch (error) {
    console.error('Similar properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Benzer emlaklar yüklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;