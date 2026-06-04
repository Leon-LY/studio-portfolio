import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// All payment routes require auth
router.use(authMiddleware)

// ============================================================
// GET /api/payments/overview — dashboard summary
// ============================================================
router.get('/overview', async (_req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        COALESCE(SUM(amount), 0) as total_expected,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_received,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM payment_milestones
    `)
    res.json({
      ...rows[0],
      // Parse numeric strings
      total_expected: parseFloat(rows[0].total_expected),
      total_received: parseFloat(rows[0].total_received),
      total_overdue: parseFloat(rows[0].total_overdue),
    })
  } catch (err) {
    console.error('GET /payments/overview error:', err)
    res.status(500).json({ error: '获取回款概览失败' })
  }
})

// ============================================================
// GET /api/payments/calendar — get milestones for a month
// ============================================================
router.get('/calendar', async (req, res) => {
  const month = req.query.month as string // format: "2026-06"
  if (!month) return res.status(400).json({ error: 'month 参数为必填项，格式：YYYY-MM' })

  try {
    const startDate = `${month}-01`
    // Calculate end of month
    const [yearStr, monthStr] = month.split('-')
    const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0).toISOString().split('T')[0]

    const { rows } = await query(
      `SELECT pm.*, p.title as project_title
       FROM payment_milestones pm
       JOIN projects p ON pm.project_id = p.id
       WHERE pm.due_date >= $1 AND pm.due_date <= $2
       ORDER BY pm.due_date, pm.sort_order`,
      [startDate, endDate],
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /payments/calendar error:', err)
    res.status(500).json({ error: '获取回款日历失败' })
  }
})

// ============================================================
// GET /api/payments/milestones — list milestones for a project
// ============================================================
router.get('/milestones', async (req, res) => {
  const projectId = req.query.project_id as string
  if (!projectId) return res.status(400).json({ error: 'project_id 参数为必填项' })

  try {
    const { rows } = await query(
      'SELECT * FROM payment_milestones WHERE project_id = $1 ORDER BY due_date, sort_order',
      [projectId],
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /payments/milestones error:', err)
    res.status(500).json({ error: '获取回款节点失败' })
  }
})

// ============================================================
// POST /api/payments/milestones — create milestone
// ============================================================
router.post('/milestones', async (req, res) => {
  const { project_id, title, amount, due_date, notes } = req.body
  if (!project_id || !title || !due_date) {
    return res.status(400).json({ error: 'project_id、title、due_date 为必填项' })
  }

  try {
    const { rows: countRows } = await query(
      'SELECT COUNT(*) FROM payment_milestones WHERE project_id = $1',
      [project_id],
    )
    const sortOrder = parseInt(countRows[0].count)

    const { rows } = await query(
      `INSERT INTO payment_milestones (project_id, title, amount, due_date, notes, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [project_id, title, amount || 0, due_date, notes || null, sortOrder],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /payments/milestones error:', err)
    res.status(500).json({ error: '创建回款节点失败' })
  }
})

// ============================================================
// PUT /api/payments/milestones/:id — update milestone
// ============================================================
router.put('/milestones/:id', async (req, res) => {
  const { title, amount, due_date, paid_date, notes } = req.body
  try {
    const { rows } = await query('SELECT * FROM payment_milestones WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '回款节点未找到' })

    const current = rows[0]
    const { rows: updated } = await query(
      `UPDATE payment_milestones
       SET title=$1, amount=$2, due_date=$3, paid_date=$4, notes=$5
       WHERE id=$6 RETURNING *`,
      [
        title ?? current.title,
        amount ?? current.amount,
        due_date ?? current.due_date,
        paid_date !== undefined ? paid_date : current.paid_date,
        notes !== undefined ? notes : current.notes,
        req.params.id,
      ],
    )
    res.json(updated[0])
  } catch (err) {
    console.error('PUT /payments/milestones/:id error:', err)
    res.status(500).json({ error: '更新回款节点失败' })
  }
})

// ============================================================
// PATCH /api/payments/milestones/:id/status — mark as paid
// ============================================================
router.patch('/milestones/:id/status', async (req, res) => {
  const { status } = req.body
  if (!status || !['pending', 'paid', 'overdue'].includes(status)) {
    return res.status(400).json({ error: 'status 必须为 pending/paid/overdue' })
  }

  try {
    const { rows } = await query('SELECT * FROM payment_milestones WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '回款节点未找到' })

    const paidDate = status === 'paid' ? new Date().toISOString().split('T')[0] : null
    const { rows: updated } = await query(
      'UPDATE payment_milestones SET status=$1, paid_date=$2 WHERE id=$3 RETURNING *',
      [status, paidDate, req.params.id],
    )
    res.json(updated[0])
  } catch (err) {
    console.error('PATCH /payments/milestones/:id/status error:', err)
    res.status(500).json({ error: '更新回款状态失败' })
  }
})

// ============================================================
// DELETE /api/payments/milestones/:id — delete milestone
// ============================================================
router.delete('/milestones/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM payment_milestones WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: '回款节点未找到' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /payments/milestones/:id error:', err)
    res.status(500).json({ error: '删除回款节点失败' })
  }
})

export default router
