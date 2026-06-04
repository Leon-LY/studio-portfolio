import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// GET /api/categories — public
router.get('/', async (req, res) => {
  try {
    const { slug } = req.query
    if (slug) {
      const { rows } = await query('SELECT * FROM categories WHERE slug = $1', [slug])
      return res.json(rows[0] || null)
    }
    const { rows } = await query('SELECT * FROM categories ORDER BY sort_order')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/categories — admin
router.post('/', authMiddleware, async (req, res) => {
  const { name, slug, description } = req.body
  try {
    const { rows } = await query(
      'INSERT INTO categories (name, slug, description) VALUES ($1,$2,$3) RETURNING *',
      [name, slug, description],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/categories/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, slug, description, sort_order } = req.body
  try {
    const { rows } = await query(
      'UPDATE categories SET name=$1, slug=$2, description=$3, sort_order=$4 WHERE id=$5 RETURNING *',
      [name, slug, description, sort_order, req.params.id],
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
