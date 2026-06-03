import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import { login, createAdmin } from './auth.js'
import projectsRouter from './routes/projects.js'
import categoriesRouter from './routes/categories.js'
import stylesRouter from './routes/styles.js'
import imagesRouter from './routes/images.js'

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
// Public routes
// ============================================================
app.get('/api/categories', categoriesRouter)
app.get('/api/styles', stylesRouter)
app.get('/api/projects/featured', projectsRouter)
app.get('/api/projects/:slug', projectsRouter)
app.get('/api/projects', projectsRouter)

// Auth
app.post('/api/auth/login', login)
app.post('/api/auth/register', createAdmin) // For initial admin creation

// ============================================================
// Admin routes (auth required)
// ============================================================
app.get('/api/projects/admin/all', projectsRouter)
app.get('/api/projects/admin/:id', projectsRouter)
app.post('/api/projects', projectsRouter)
app.put('/api/projects/:id', projectsRouter)
app.patch('/api/projects/:id/status', projectsRouter)
app.delete('/api/projects/:id', projectsRouter)

app.post('/api/categories', categoriesRouter)
app.put('/api/categories/:id', categoriesRouter)
app.delete('/api/categories/:id', categoriesRouter)

app.post('/api/styles', stylesRouter)
app.delete('/api/styles/:id', stylesRouter)

app.post('/api/images/upload', imagesRouter)
app.delete('/api/images/:id', imagesRouter)
app.put('/api/images/:id/cover', imagesRouter)
app.put('/api/images/reorder', imagesRouter)

// ============================================================
// Start
// ============================================================
app.listen(PORT, () => {
  console.log(`Studio API server running on http://localhost:${PORT}`)
})
