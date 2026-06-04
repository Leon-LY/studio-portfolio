import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

// POST /api/contact — submit contact form (public)
router.post('/', async (req, res) => {
  const { name, email, projectType, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: '请填写所有必填字段（姓名、邮箱、留言）' })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '请填写有效的邮箱地址' })
  }

  try {
    // Store in database if a contacts table exists, otherwise just log
    // For now, log to console and return success
    console.log('Contact form submission:', { name, email, projectType, message })

    res.status(201).json({ success: true, message: '留言已收到，我们会尽快与您联系。' })
  } catch (err) {
    console.error('Contact form error:', err)
    res.status(500).json({ error: '提交失败，请稍后重试' })
  }
})

export default router
