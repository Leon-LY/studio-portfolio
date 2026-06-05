import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// GET /api/styles — public
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM styles ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch styles' })
  }
})

// POST /api/styles — admin
router.post('/', authMiddleware, async (req, res) => {
  const { name, slug } = req.body
  try {
    const { rows } = await query(
      'INSERT INTO styles (name, slug) VALUES ($1,$2) RETURNING *',
      [name, slug],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create style' })
  }
})

// PUT /api/styles/:id — admin (rename)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, slug } = req.body
  try {
    const { rows: existing } = await query('SELECT * FROM styles WHERE id = $1', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: 'Not found' })
    const { rows } = await query(
      'UPDATE styles SET name=$1, slug=$2 WHERE id=$3 RETURNING *',
      [name ?? existing[0].name, slug ?? existing[0].slug, req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update style' })
  }
})

// DELETE /api/styles/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM styles WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete style' })
  }
})

export default router
