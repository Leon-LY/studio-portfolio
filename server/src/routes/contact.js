import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const router = Router()

// Simple in-memory rate limiter for contact form
const contactAttempts = new Map() // IP → { count, resetAt }
const MAX_CONTACT_PER_HOUR = 5

function checkContactRateLimit(ip) {
  const now = Date.now()
  const entry = contactAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    contactAttempts.set(ip, { count: 1, resetAt: now + 3600000 })
    return true
  }
  if (entry.count >= MAX_CONTACT_PER_HOUR) return false
  entry.count++
  return true
}

// POST /api/contact — submit contact form (public)
router.post('/', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  if (!checkContactRateLimit(ip)) {
    return res.status(429).json({ error: '提交过于频繁，请1小时后再试' })
  }

  const { name, phone, message } = req.body

  if (!name || !phone || !message) {
    return res.status(400).json({ error: '请填写所有必填字段（姓名、手机号、留言）' })
  }

  // Basic phone validation (Chinese mobile)
  if (!/^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ error: '请填写有效的手机号码' })
  }

  try {
    // Persist to database
    await query(
      `INSERT INTO contacts (name, phone, message, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [name, phone, message, ip],
    )
    console.log('Contact form submission saved:', { name, phone })
    res.status(201).json({ success: true, message: '留言已收到，我们会尽快与您联系。' })
  } catch (err) {
    console.error('Contact form error:', err)
    console.log('Contact form submission (fallback):', { name, phone, message })
    res.status(500).json({ error: '提交失败，请稍后重试' })
  }
})

// GET /api/contacts — list submissions (admin)
router.get('/', authMiddleware, async (req, res) => {
  const { is_read } = req.query
  try {
    let sql = 'SELECT * FROM contacts'
    const params = []
    if (is_read === 'true') { sql += ' WHERE is_read = true' }
    else if (is_read === 'false') { sql += ' WHERE is_read = false' }
    sql += ' ORDER BY created_at DESC'
    const { rows } = await query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('GET /contacts error:', err)
    res.status(500).json({ error: '获取留言失败' })
  }
})

// PUT /api/contacts/:id/read — mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await query('UPDATE contacts SET is_read = true WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '标记已读失败' })
  }
})

// DELETE /api/contact/:id — delete message
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM contacts WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除留言失败' })
  }
})

export default router
