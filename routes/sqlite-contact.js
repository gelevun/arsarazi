const express = require('express');
const Joi = require('joi');
const { query } = require('../config/sqlite-database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional(),
  subject: Joi.string().valid(
    'arsa-arama', 'fiyat-bilgisi', 'randevu', 'degerlendirme', 'diger'
  ).required(),
  message: Joi.string().min(10).max(1000).required(),
  property_id: Joi.number().integer().optional()
});

// Helper function to get subject display name
const getSubjectDisplay = (subject) => {
  const subjects = {
    'arsa-arama': 'Arsa Arama',
    'fiyat-bilgisi': 'Fiyat Bilgisi',
    'randevu': 'Randevu Talebi',
    'degerlendirme': 'Değerlendirme',
    'diger': 'Diğer'
  };
  return subjects[subject] || 'Diğer';
};

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { error, value: contactData } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // Insert contact submission
    const result = query(`
      INSERT INTO contact_submissions (
        name, email, phone, subject, message, property_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      contactData.name,
      contactData.email,
      contactData.phone || null,
      contactData.subject,
      contactData.message,
      contactData.property_id || null,
      'new'
    ]);

    // Get the created submission
    const newSubmission = query('SELECT * FROM contact_submissions WHERE id = ?', [result.lastInsertRowid]);
    const submission = newSubmission[0];

    // Process submission data
    const processedSubmission = {
      ...submission,
      subject_display: getSubjectDisplay(submission.subject)
    };

    // Log for admin notification (in a real app, send email)
    console.log(`📧 Yeni İletişim Formu:
    İsim: ${contactData.name}
    Email: ${contactData.email}
    Telefon: ${contactData.phone || 'Belirtilmemiş'}
    Konu: ${getSubjectDisplay(contactData.subject)}
    Mesaj: ${contactData.message}
    Tarih: ${new Date().toLocaleString('tr-TR')}
    `);

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.',
      data: {
        submission: processedSubmission
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken hata oluştu. Lütfen tekrar deneyin.',
      error: error.message
    });
  }
});

// GET /api/contact - Get all contact submissions (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = '';
    let params = [];
    
    if (status !== 'all') {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM contact_submissions ${whereClause}`;
    const totalResult = query(countQuery, params);
    const totalItems = totalResult[0]?.total || 0;

    // Get submissions
    const submissionsQuery = `
      SELECT 
        cs.*,
        p.title as property_title
      FROM contact_submissions cs
      LEFT JOIN properties p ON cs.property_id = p.id
      ${whereClause}
      ORDER BY cs.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const submissions = query(submissionsQuery, [...params, limit, offset]);

    // Process submissions
    const processedSubmissions = submissions.map(submission => ({
      ...submission,
      subject_display: getSubjectDisplay(submission.subject),
      created_at_formatted: new Date(submission.created_at).toLocaleString('tr-TR')
    }));

    res.json({
      success: true,
      data: {
        submissions: processedSubmissions,
        pagination: {
          page,
          limit,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / limit),
          has_next: page < Math.ceil(totalItems / limit),
          has_prev: page > 1
        },
        stats: {
          total: totalItems,
          new: query('SELECT COUNT(*) as count FROM contact_submissions WHERE status = ?', ['new'])[0]?.count || 0,
          responded: query('SELECT COUNT(*) as count FROM contact_submissions WHERE status = ?', ['responded'])[0]?.count || 0,
          closed: query('SELECT COUNT(*) as count FROM contact_submissions WHERE status = ?', ['closed'])[0]?.count || 0
        }
      }
    });

  } catch (error) {
    console.error('Contact submissions list error:', error);
    res.status(500).json({
      success: false,
      message: 'İletişim formları listelenirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/contact/:id - Get single contact submission (Admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const submissionId = parseInt(req.params.id);
    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz form ID'
      });
    }

    const submissions = query(`
      SELECT 
        cs.*,
        p.title as property_title,
        p.id as property_id
      FROM contact_submissions cs
      LEFT JOIN properties p ON cs.property_id = p.id
      WHERE cs.id = ?
    `, [submissionId]);

    const submission = submissions[0];

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'İletişim formu bulunamadı'
      });
    }

    const processedSubmission = {
      ...submission,
      subject_display: getSubjectDisplay(submission.subject),
      created_at_formatted: new Date(submission.created_at).toLocaleString('tr-TR')
    };

    res.json({
      success: true,
      data: {
        submission: processedSubmission
      }
    });

  } catch (error) {
    console.error('Contact submission detail error:', error);
    res.status(500).json({
      success: false,
      message: 'İletişim formu detayları yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// PUT /api/contact/:id/status - Update contact submission status (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const submissionId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz form ID'
      });
    }

    if (!['new', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum. Geçerli durumlar: new, responded, closed'
      });
    }

    const result = query(
      'UPDATE contact_submissions SET status = ? WHERE id = ?',
      [status, submissionId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'İletişim formu bulunamadı'
      });
    }

    // Get updated submission
    const updatedSubmission = query('SELECT * FROM contact_submissions WHERE id = ?', [submissionId]);

    res.json({
      success: true,
      message: 'Durum başarıyla güncellendi',
      data: {
        submission: {
          ...updatedSubmission[0],
          subject_display: getSubjectDisplay(updatedSubmission[0].subject)
        }
      }
    });

  } catch (error) {
    console.error('Contact submission status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Durum güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// DELETE /api/contact/:id - Delete contact submission (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const submissionId = parseInt(req.params.id);
    if (isNaN(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz form ID'
      });
    }

    const result = query('DELETE FROM contact_submissions WHERE id = ?', [submissionId]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'İletişim formu bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'İletişim formu başarıyla silindi'
    });

  } catch (error) {
    console.error('Contact submission deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'İletişim formu silinirken hata oluştu',
      error: error.message
    });
  }
});

// GET /api/contact/stats/summary - Get contact statistics (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    // Get stats by status
    const statusStats = query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM contact_submissions 
      GROUP BY status
    `);

    // Get stats by subject
    const subjectStats = query(`
      SELECT 
        subject,
        COUNT(*) as count
      FROM contact_submissions 
      GROUP BY subject
      ORDER BY count DESC
    `);

    // Get recent submissions count (last 7 days)
    const recentCount = query(`
      SELECT COUNT(*) as count
      FROM contact_submissions 
      WHERE created_at >= datetime('now', '-7 days')
    `)[0]?.count || 0;

    // Process subject stats
    const processedSubjectStats = subjectStats.map(stat => ({
      ...stat,
      subject_display: getSubjectDisplay(stat.subject)
    }));

    res.json({
      success: true,
      data: {
        status_stats: statusStats,
        subject_stats: processedSubjectStats,
        recent_count: recentCount,
        total_count: statusStats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });

  } catch (error) {
    console.error('Contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İletişim istatistikleri yüklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;