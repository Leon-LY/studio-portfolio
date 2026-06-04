import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, _file, cb) => {
    const unique = `hero-${Date.now()}${path.extname(_file.originalname)}`
    cb(null, unique)
  },
})

const heroUpload = multer({
  storage: heroStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, ['.jpg', '.jpeg', '.png', '.webp'].includes(ext))
  },
})

const router = Router()

// All routes require auth
router.use(authMiddleware)

// GET /api/settings — get all settings
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT key, value FROM site_settings ORDER BY key')
    const settings = {}
    for (const r of rows) settings[r.key] = r.value
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: '获取设置失败' })
  }
})

// PUT /api/settings — update settings
router.put('/', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value !== 'string') continue
      await query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value],
      )
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '更新设置失败' })
  }
})

// POST /api/settings/hero-image — upload hero background image
router.post('/hero-image', heroUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请选择图片' })
  const url = `/uploads/${req.file.filename}`
  // Save to site_settings
  await query(
    `INSERT INTO site_settings (key, value) VALUES ('hero_image', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [url],
  )
  res.json({ url })
})

export default router
