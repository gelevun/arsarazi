const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all published blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    let whereConditions = ['is_published = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM blog_posts WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get blog posts
    const result = await query(
      `SELECT bp.*, u.name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE ${whereClause}
       ORDER BY bp.published_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const posts = result.rows.map(post => ({
      ...post,
      tags: post.tags || []
    }));

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/blog/:id
// @desc    Get single blog post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz post ID'
      });
    }

    // Increment view count
    await query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [postId]
    );

    // Get blog post
    const result = await query(
      `SELECT bp.*, u.name as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = $1 AND bp.is_published = true`,
      [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog yazısı bulunamadı'
      });
    }

    const post = {
      ...result.rows[0],
      tags: result.rows[0].tags || []
    };

    // Get related posts
    const relatedResult = await query(
      `SELECT id, title, summary, featured_image, published_at, category
       FROM blog_posts 
       WHERE id != $1 AND category = $2 AND is_published = true
       ORDER BY published_at DESC
       LIMIT 3`,
      [postId, post.category]
    );

    res.json({
      success: true,
      data: {
        post,
        related_posts: relatedResult.rows
      }
    });

  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;