import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/clients — list all clients with project names
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', p.id, 'title', p.title, 'slug', p.slug))
           FROM projects p WHERE p.client_id = c.id),
          '[]'::json
        ) AS projects,
        COUNT(p.id)::int AS project_count
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

// POST /api/clients — create client with optional project association
router.post('/', async (req, res) => {
  const { name, contact_person, phone, email, address, notes, project_ids } = req.body
  if (!name) return res.status(400).json({ error: '客户名称为必填项' })
  try {
    const { rows } = await query(
      `INSERT INTO clients (name, contact_person, phone, email, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, contact_person || null, phone || null, email || null, address || null, notes || null]
    )
    const client = rows[0]
    // Associate projects
    if (project_ids && project_ids.length > 0) {
      await query(
        `UPDATE projects SET client_id = $1 WHERE id = ANY($2::uuid[])`,
        [client.id, project_ids]
      )
    }
    res.status(201).json(client)
  } catch (err) {
    console.error('Create client error:', err)
    res.status(500).json({ error: '创建客户失败' })
  }
})

// PUT /api/clients/:id — update client with optional project association
router.put('/:id', async (req, res) => {
  const { name, contact_person, phone, email, address, notes, project_ids } = req.body
  try {
    const { rows } = await query(
      `UPDATE clients SET name=$1, contact_person=$2, phone=$3, email=$4, address=$5, notes=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, contact_person || null, phone || null, email || null, address || null, notes || null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: '客户不存在' })
    // Update project associations: first unlink all, then link selected
    await query('UPDATE projects SET client_id = NULL WHERE client_id = $1', [req.params.id])
    if (project_ids && project_ids.length > 0) {
      await query(
        'UPDATE projects SET client_id = $1 WHERE id = ANY($2::uuid[])',
        [req.params.id, project_ids]
      )
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Update client error:', err)
    res.status(500).json({ error: '更新客户失败' })
  }
})

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM clients WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除客户失败' })
  }
})

export default router
