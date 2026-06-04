import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import { login, createAdmin } from './auth.js'
import projectsRouter from './routes/projects.js'
import categoriesRouter from './routes/categories.js'
import stylesRouter from './routes/styles.js'
import imagesRouter from './routes/images.js'
import filesRouter from './routes/files.js'
import paymentsRouter from './routes/payments.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.API_PORT || 3001
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR))

// ============================================================
// Routes — use app.use() to mount routers properly
// ============================================================

// Public
app.use('/api/categories', categoriesRouter)
app.use('/api/styles', stylesRouter)
app.use('/api/projects', projectsRouter)

// Auth
app.post('/api/auth/login', login)
app.post('/api/auth/register', createAdmin)

// Images
app.use('/api/images', imagesRouter)

// Files (project attachments)
app.use('/api/files', filesRouter)

// Payments (milestones)
app.use('/api/payments', paymentsRouter)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ============================================================
// Start
// ============================================================
app.listen(PORT, () => {
  console.log(`Studio API running on http://localhost:${PORT}`)
})
