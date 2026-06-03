import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './server/uploads'

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Multer config: store files in uploads/ with original name + timestamp
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

const router = Router()

// POST /api/images/upload — upload image for a project
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const { project_id, alt_text } = req.body
  if (!project_id) return res.status(400).json({ error: 'project_id required' })

  try {
    // Get current image count for sort_order
    const { rows: countRows } = await query(
      'SELECT COUNT(*) FROM project_images WHERE project_id = $1',
      [project_id],
    )
    const sortOrder = parseInt(countRows[0].count)

    const { rows } = await query(
      'INSERT INTO project_images (project_id, storage_path, alt_text, sort_order, is_cover) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [project_id, req.file.filename, alt_text || '', sortOrder, sortOrder === 0],
    )

    // If this is the first image, set as cover on project
    if (sortOrder === 0) {
      const imageUrl = `/uploads/${req.file.filename}`
      await query('UPDATE projects SET cover_image_url = $1 WHERE id = $2', [imageUrl, project_id])
    }

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /images/upload error:', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// DELETE /api/images/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_images WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const img = rows[0]

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, img.storage_path)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    // Delete from DB
    await query('DELETE FROM project_images WHERE id = $1', [req.params.id])

    // If was cover, reassign cover to first remaining image
    if (img.is_cover) {
      const { rows: remaining } = await query(
        'SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order LIMIT 1',
        [img.project_id],
      )
      if (remaining.length > 0) {
        const newCover = remaining[0]
        await query('UPDATE project_images SET is_cover = true WHERE id = $1', [newCover.id])
        await query('UPDATE projects SET cover_image_url = $1 WHERE id = $2',
          [`/uploads/${newCover.storage_path}`, img.project_id],
        )
      } else {
        await query('UPDATE projects SET cover_image_url = NULL WHERE id = $1', [img.project_id])
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /images/:id error:', err)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

// PUT /api/images/:id/cover — set as cover
router.put('/:id/cover', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_images WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const img = rows[0]

    // Unset all covers for this project
    await query('UPDATE project_images SET is_cover = false WHERE project_id = $1', [img.project_id])
    // Set new cover
    await query('UPDATE project_images SET is_cover = true WHERE id = $1', [req.params.id])
    // Update project
    await query('UPDATE projects SET cover_image_url = $1 WHERE id = $2',
      [`/uploads/${img.storage_path}`, img.project_id],
    )

    res.json({ success: true })
  } catch (err) {
    console.error('PUT /images/:id/cover error:', err)
    res.status(500).json({ error: 'Failed to set cover' })
  }
})

// PUT /api/images/reorder — reorder images
router.put('/reorder', authMiddleware, async (req, res) => {
  const { project_id, image_ids } = req.body
  try {
    for (let i = 0; i < image_ids.length; i++) {
      await query('UPDATE project_images SET sort_order = $1 WHERE id = $2 AND project_id = $3',
        [i, image_ids[i], project_id],
      )
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder' })
  }
})

export default router
