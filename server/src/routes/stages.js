import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/stages — list all stages
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_stages ORDER BY sort_order')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: '获取阶段失败' })
  }
})

// POST /api/stages — create new stage
router.post('/', async (req, res) => {
  const { name, color } = req.body
  if (!name) return res.status(400).json({ error: '阶段名称不能为空' })
  try {
    const { rows: maxRow } = await query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM project_stages')
    const { rows } = await query(
      'INSERT INTO project_stages (name, color, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [name, color || '#78756c', maxRow[0].next],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: '创建阶段失败' })
  }
})

// PUT /api/stages/reorder — batch reorder stages (must be before /:id)
router.put('/reorder', async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids 必须为数组' })
  try {
    for (let i = 0; i < ids.length; i++) {
      await query('UPDATE project_stages SET sort_order = $1 WHERE id = $2', [i, ids[i]])
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '排序失败' })
  }
})

// PUT /api/stages/project/:id — update project stage (must be before /:id)
router.put('/project/:id', async (req, res) => {
  try {
    const { stage_id } = req.body
    await query('UPDATE projects SET stage_id = $1, updated_at = NOW() WHERE id = $2', [stage_id || null, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '更新阶段失败' })
  }
})

// PUT /api/stages/:id — update stage name/color/sort_order
router.put('/:id', async (req, res) => {
  const { name, color, sort_order } = req.body
  try {
    const { rows: existing } = await query('SELECT * FROM project_stages WHERE id = $1', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: '阶段未找到' })
    const { rows } = await query(
      'UPDATE project_stages SET name=$1, color=$2, sort_order=$3 WHERE id=$4 RETURNING *',
      [name ?? existing[0].name, color ?? existing[0].color, sort_order ?? existing[0].sort_order, req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: '更新阶段失败' })
  }
})

// DELETE /api/stages/:id — delete stage
router.delete('/:id', async (req, res) => {
  try {
    await query('UPDATE projects SET stage_id = NULL WHERE stage_id = $1', [req.params.id])
    await query('DELETE FROM project_stages WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除阶段失败' })
  }
})

export default router
