import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { authMiddleware, requireRole } from '../auth.js'

const router = Router()

// All routes require admin role
router.use(authMiddleware)
router.use(requireRole('admin'))

// GET /api/users — list all users
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, email, full_name, role, created_at FROM admins ORDER BY created_at DESC',
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /users error:', err)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

// POST /api/users — create a new user
router.post('/', async (req, res) => {
  const { email, password, full_name, role } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码为必填项' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '请填写有效的邮箱地址' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' })
  }

  try {
    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await query(
      'INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
      [email, hashed, full_name || '', role || 'editor'],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: '该邮箱已被使用' })
    }
    console.error('POST /users error:', err)
    res.status(500).json({ error: '创建用户失败' })
  }
})

// PUT /api/users/:id — update user info (name, role)
router.put('/:id', async (req, res) => {
  const { full_name, role } = req.body

  try {
    const { rows: existing } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: '用户未找到' })

    const { rows } = await query(
      'UPDATE admins SET full_name = $1, role = $2 WHERE id = $3 RETURNING id, email, full_name, role, created_at',
      [full_name ?? existing[0].full_name, role ?? existing[0].role, req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    console.error('PUT /users/:id error:', err)
    res.status(500).json({ error: '更新用户失败' })
  }
})

// PUT /api/users/:id/password — change user's password
router.put('/:id/password', async (req, res) => {
  const { current_password, new_password } = req.body

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: '新密码长度不能少于6位' })
  }

  try {
    const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '用户未找到' })

    const user = rows[0]

    // If changing own password, verify current password
    if (req.user.id === req.params.id) {
      if (!current_password) {
        return res.status(400).json({ error: '请输入当前密码' })
      }
      const valid = await bcrypt.compare(current_password, user.password)
      if (!valid) {
        return res.status(403).json({ error: '当前密码不正确' })
      }
    }
    // Admin can change any user's password without current password

    const hashed = await bcrypt.hash(new_password, 10)
    await query('UPDATE admins SET password = $1 WHERE id = $2', [hashed, req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('PUT /users/:id/password error:', err)
    res.status(500).json({ error: '修改密码失败' })
  }
})

// DELETE /api/users/:id — delete a user (can't delete self)
router.delete('/:id', async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: '不能删除自己的账号' })
  }

  try {
    // Don't allow deleting the last admin
    const { rows: admins } = await query("SELECT COUNT(*) FROM admins WHERE role = 'admin'")
    const { rows: target } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id])
    if (target.length === 0) return res.status(404).json({ error: '用户未找到' })
    if (target[0].role === 'admin' && parseInt(admins[0].count) <= 1) {
      return res.status(400).json({ error: '不能删除最后一个管理员' })
    }

    await query('DELETE FROM admins WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /users/:id error:', err)
    res.status(500).json({ error: '删除用户失败' })
  }
})

export default router
