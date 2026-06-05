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

// PUT /api/projects/:id/stage — update project stage
router.put('/project/:id', async (req, res) => {
  try {
    const { stage_id } = req.body
    await query('UPDATE projects SET stage_id = $1, updated_at = NOW() WHERE id = $2', [stage_id || null, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '更新阶段失败' })
  }
})

export default router
