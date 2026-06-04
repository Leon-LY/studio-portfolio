import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// ============================================================
// Public routes (no auth)
// ============================================================

// GET /api/projects — list published projects (public)
router.get('/', async (req, res) => {
  const {
    search, category, style,
    page = 1, perPage = 12,
    sortBy = 'sort_order', sortOrder = 'desc',
  } = req.query

  try {
    let sql = `
      SELECT DISTINCT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN project_styles ps ON p.id = ps.project_id
      LEFT JOIN styles s ON ps.style_id = s.id
      WHERE p.status = 'published'
    `
    const params = []
    let paramIndex = 1

    if (search) {
      params.push(`%${search}%`)
      sql += ` AND (p.title ILIKE $${paramIndex++} OR p.description ILIKE $${paramIndex++})`
      params.push(`%${search}%`)
    }
    if (category) {
      params.push(category)
      sql += ` AND c.slug = $${paramIndex++}`
    }
    if (style) {
      params.push(style)
      sql += ` AND s.slug = $${paramIndex++}`
    }

    // Count
    const countSql = `SELECT COUNT(*) FROM (${sql}) sub`
    const { rows: countRows } = await query(countSql, params)
    const total = parseInt(countRows[0].count)

    // Sort & paginate
    const orderCols = { sort_order: 'p.sort_order', created_at: 'p.created_at', updated_at: 'p.updated_at', completion_date: 'p.completion_date' }
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC'
    sql += ` ORDER BY ${orderCols[sortBy] || 'p.sort_order'} ${order}, p.created_at DESC`
    params.push(perPage)
    sql += ` LIMIT $${paramIndex++}`
    params.push((page - 1) * perPage)
    sql += ` OFFSET $${paramIndex++}`

    const { rows } = await query(sql, params)

    // Fetch styles for all projects in one batch query
    const projectIds = rows.map(p => p.id)
    if (projectIds.length > 0) {
      const { rows: allStyleRows } = await query(
        `SELECT ps.project_id, s.id, s.name, s.slug, s.created_at
         FROM styles s JOIN project_styles ps ON s.id = ps.style_id
         WHERE ps.project_id = ANY($1::uuid[])`,
        [projectIds],
      )
      const stylesMap = {}
      for (const row of allStyleRows) {
        if (!stylesMap[row.project_id]) stylesMap[row.project_id] = []
        stylesMap[row.project_id].push({ id: row.id, name: row.name, slug: row.slug, created_at: row.created_at })
      }
      for (const project of rows) {
        project.category = project.cat_id ? { id: project.cat_id, name: project.cat_name, slug: project.cat_slug } : null
        project.styles = stylesMap[project.id] || []
      }
    } else {
      for (const project of rows) {
        project.category = project.cat_id ? { id: project.cat_id, name: project.cat_name, slug: project.cat_slug } : null
        project.styles = []
      }
    }

    res.json({
      data: rows,
      count: total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / perPage),
    })
  } catch (err) {
    console.error('GET /projects error:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/featured — featured projects for homepage
router.get('/featured', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug
       FROM projects p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'published' AND p.is_featured = true
       ORDER BY p.sort_order DESC LIMIT 6`,
    )
    // Batch fetch styles
    const projectIds = rows.map(p => p.id)
    const stylesMap = {}
    if (projectIds.length > 0) {
      const { rows: allStyleRows } = await query(
        `SELECT ps.project_id, s.id, s.name, s.slug, s.created_at
         FROM styles s JOIN project_styles ps ON s.id = ps.style_id
         WHERE ps.project_id = ANY($1::uuid[])`,
        [projectIds],
      )
      for (const row of allStyleRows) {
        if (!stylesMap[row.project_id]) stylesMap[row.project_id] = []
        stylesMap[row.project_id].push({ id: row.id, name: row.name, slug: row.slug, created_at: row.created_at })
      }
    }
    for (const project of rows) {
      project.category = project.cat_id ? { id: project.cat_id, name: project.cat_name, slug: project.cat_slug } : null
      project.styles = stylesMap[project.id] || []
    }
    res.json(rows)
  } catch (err) {
    console.error('GET /projects/featured error:', err)
    res.status(500).json({ error: 'Failed to fetch featured projects' })
  }
})

// GET /api/projects/:slug — single project detail (public)
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM projects WHERE slug = $1 AND status = 'published'`,
      [req.params.slug],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })

    const project = rows[0]
    // Category
    if (project.category_id) {
      const { rows: catRows } = await query('SELECT * FROM categories WHERE id = $1', [project.category_id])
      project.category = catRows[0] || null
    }
    // Styles
    const { rows: styleRows } = await query(
      'SELECT s.* FROM styles s JOIN project_styles ps ON s.id = ps.style_id WHERE ps.project_id = $1',
      [project.id],
    )
    project.styles = styleRows
    // Images
    const { rows: imgRows } = await query(
      'SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order',
      [project.id],
    )
    project.images = imgRows

    // Related projects
    if (project.category_id) {
      const { rows: related } = await query(
        `SELECT * FROM projects WHERE category_id = $1 AND slug != $2 AND status = 'published' LIMIT 4`,
        [project.category_id, req.params.slug],
      )
      project.related = related
    }

    res.json(project)
  } catch (err) {
    console.error('GET /projects/:slug error:', err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// ============================================================
// Admin routes (auth required)
// ============================================================

// GET /api/projects/admin/all — all projects (draft/published/archived)
router.get('/admin/all', authMiddleware, async (req, res) => {
  const { status, search, page = 1, perPage = 20 } = req.query
  try {
    let sql = `
      SELECT p.*, c.id as cat_id, c.name as cat_name
      FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1
    `
    const params = []
    let i = 1
    if (status) { params.push(status); sql += ` AND p.status = $${i++}` }
    if (search) { params.push(`%${search}%`); sql += ` AND p.title ILIKE $${i++}` }

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM (${sql}) sub`, params)
    const total = parseInt(countRows[0].count)

    sql += ' ORDER BY p.updated_at DESC'
    params.push(perPage); sql += ` LIMIT $${i++}`
    params.push((page - 1) * perPage); sql += ` OFFSET $${i++}`

    const { rows } = await query(sql, params)
    const projects = rows.map(p => ({
      ...p,
      category: p.cat_id ? { id: p.cat_id, name: p.cat_name } : null,
    }))

    res.json({ data: projects, count: total, page: parseInt(page), perPage: parseInt(perPage), totalPages: Math.ceil(total / perPage) })
  } catch (err) {
    console.error('GET /projects/admin/all error:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/admin/:id — single project (admin, with all data)
router.get('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM projects WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const project = rows[0]
    if (project.category_id) {
      const { rows: catRows } = await query('SELECT * FROM categories WHERE id = $1', [project.category_id])
      project.category = catRows[0] || null
    }
    const { rows: styleRows } = await query(
      'SELECT s.* FROM styles s JOIN project_styles ps ON s.id = ps.style_id WHERE ps.project_id = $1',
      [project.id],
    )
    project.styles = styleRows
    const { rows: imgRows } = await query(
      'SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order',
      [project.id],
    )
    project.images = imgRows
    res.json(project)
  } catch (err) {
    console.error('GET /projects/admin/:id error:', err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/projects — create project
router.post('/', authMiddleware, async (req, res) => {
  const { title, slug, description, content, category_id, status, completion_date, location, client, area_sqm, is_featured, style_ids, seo_title, seo_description } = req.body
  try {
    const { rows } = await query(
      `INSERT INTO projects (title, slug, description, content, category_id, status, completion_date, location, client, area_sqm, is_featured, seo_title, seo_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [title, slug, description, content, category_id, status || 'draft', completion_date, location, client, area_sqm, is_featured || false, seo_title, seo_description],
    )
    const project = rows[0]
    if (style_ids && style_ids.length > 0) {
      for (const sid of style_ids) {
        await query('INSERT INTO project_styles (project_id, style_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [project.id, sid])
      }
    }
    res.status(201).json(project)
  } catch (err) {
    console.error('POST /projects error:', err)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// PUT /api/projects/:id — update project
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, slug, description, content, category_id, status, completion_date, location, client, area_sqm, is_featured, style_ids, seo_title, seo_description } = req.body
  try {
    const { rows } = await query(
      `UPDATE projects SET title=$1, slug=$2, description=$3, content=$4, category_id=$5, status=$6, completion_date=$7, location=$8, client=$9, area_sqm=$10, is_featured=$11, seo_title=$12, seo_description=$13
       WHERE id=$14 RETURNING *`,
      [title, slug, description, content, category_id, status, completion_date, location, client, area_sqm, is_featured, seo_title, seo_description, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    // Replace styles
    await query('DELETE FROM project_styles WHERE project_id = $1', [req.params.id])
    if (style_ids && style_ids.length > 0) {
      for (const sid of style_ids) {
        await query('INSERT INTO project_styles (project_id, style_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, sid])
      }
    }
    res.json(rows[0])
  } catch (err) {
    console.error('PUT /projects/:id error:', err)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// PATCH /api/projects/:id/status — publish/archive
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body
  const updates = { status }
  if (status === 'archived') updates.archived_at = new Date().toISOString()
  if (status === 'published') updates.archived_at = null
  try {
    const { rows } = await query(
      'UPDATE projects SET status=$1, archived_at=$2 WHERE id=$3 RETURNING *',
      [status, updates.archived_at || null, req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    console.error('PATCH /projects/:id/status error:', err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /projects/:id error:', err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
