import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/clients — list all clients
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*, COUNT(p.id)::int AS project_count
       FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    )
    res.json(rows)
  } catch (err) {
    console.error('List clients error:', err)
    res.status(500).json({ error: '获取客户列表失败' })
  }
})

// GET /api/clients/:id/projects — projects for a client
router.get('/:id/projects', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.name as category_name
       FROM projects p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.client_id = $1
       ORDER BY p.updated_at DESC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: '获取客户项目失败' })
  }
})

// POST /api/clients — create client
router.post('/', async (req, res) => {
  const { name, contact_person, phone, email, address, notes } = req.body
  if (!name) return res.status(400).json({ error: '客户名称为必填项' })
  try {
    const { rows } = await query(
      `INSERT INTO clients (name, contact_person, phone, email, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, contact_person || null, phone || null, email || null, address || null, notes || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create client error:', err)
    res.status(500).json({ error: '创建客户失败' })
  }
})

// PUT /api/clients/:id — update client
router.put('/:id', async (req, res) => {
  const { name, contact_person, phone, email, address, notes } = req.body
  try {
    const { rows } = await query(
      `UPDATE clients SET name=$1, contact_person=$2, phone=$3, email=$4, address=$5, notes=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, contact_person || null, phone || null, email || null, address || null, notes || null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: '客户不存在' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: '更新客户失败' })
  }
})

// DELETE /api/clients/:id — delete client (projects set to NULL via ON DELETE SET NULL)
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM clients WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除客户失败' })
  }
})

export default router
