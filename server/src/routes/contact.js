import { Router } from 'express'
import { query } from '../db.js'

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

  const { name, email, projectType, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: '请填写所有必填字段（姓名、邮箱、留言）' })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '请填写有效的邮箱地址' })
  }

  try {
    // Persist to database
    await query(
      `INSERT INTO contacts (name, email, project_type, message, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, projectType || null, message, ip],
    )
    console.log('Contact form submission saved:', { name, email, projectType })
    res.status(201).json({ success: true, message: '留言已收到，我们会尽快与您联系。' })
  } catch (err) {
    console.error('Contact form error:', err)
    // Fall back to console log if DB insert fails
    console.log('Contact form submission (fallback):', { name, email, projectType, message })
    res.status(500).json({ error: '提交失败，请稍后重试' })
  }
})

export default router
