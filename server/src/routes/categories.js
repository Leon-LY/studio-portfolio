import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// GET /api/categories — public (only visible by default)
router.get('/', async (req, res) => {
  try {
    const { slug, all } = req.query
    if (slug) {
      const { rows } = await query('SELECT * FROM categories WHERE slug = $1', [slug])
      return res.json(rows[0] || null)
    }
    // Admin can request all categories with ?all=1
    const filter = all === '1' ? '' : 'WHERE is_visible = true'
    const { rows } = await query(`SELECT * FROM categories ${filter} ORDER BY sort_order`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/categories — admin
router.post('/', authMiddleware, async (req, res) => {
  const { name, slug, description, is_visible } = req.body
  try {
    const { rows } = await query(
      'INSERT INTO categories (name, slug, description, is_visible) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, slug, description, is_visible ?? true],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/categories/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, slug, description, sort_order, is_visible } = req.body
  try {
    const { rows: existing } = await query('SELECT * FROM categories WHERE id = $1', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: 'Not found' })
    const { rows } = await query(
      'UPDATE categories SET name=$1, slug=$2, description=$3, sort_order=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name ?? existing[0].name, slug ?? existing[0].slug, description ?? existing[0].description, sort_order ?? existing[0].sort_order, is_visible ?? existing[0].is_visible, req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/categories/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
