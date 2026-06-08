import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/expenses/categories — list expense categories
router.get('/categories', async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM expense_categories ORDER BY sort_order')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: '获取费用分类失败' })
  }
})

// GET /api/expenses?project_id= — list expenses for a project
router.get('/', async (req, res) => {
  const { project_id } = req.query
  if (!project_id) return res.status(400).json({ error: 'project_id 为必填项' })
  try {
    const { rows } = await query(
      `SELECT pe.*, ec.name as category_name
       FROM project_expenses pe
       LEFT JOIN expense_categories ec ON pe.category_id = ec.id
       WHERE pe.project_id = $1
       ORDER BY pe.expense_date DESC, pe.created_at DESC`,
      [project_id],
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: '获取费用列表失败' })
  }
})

// POST /api/expenses — create expense
router.post('/', async (req, res) => {
  const { project_id, category_id, amount, description, expense_date } = req.body
  if (!project_id || !amount) return res.status(400).json({ error: 'project_id 和 amount 为必填项' })
  try {
    const { rows } = await query(
      `INSERT INTO project_expenses (project_id, category_id, amount, description, expense_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, category_id || null, amount, description || '', expense_date || new Date().toISOString().split('T')[0]],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: '创建费用记录失败' })
  }
})

// PUT /api/expenses/:id — update expense
router.put('/:id', async (req, res) => {
  const { category_id, amount, description, expense_date } = req.body
  try {
    const { rows } = await query(
      `UPDATE project_expenses SET category_id=$1, amount=$2, description=$3, expense_date=$4 WHERE id=$5 RETURNING *`,
      [category_id || null, amount, description || '', expense_date, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: '费用记录不存在' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: '更新费用记录失败' })
  }
})

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM project_expenses WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除费用记录失败' })
  }
})

export default router
