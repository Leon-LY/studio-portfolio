import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { query } from '../db.js'
import { authMiddleware } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads')
const FILES_DIR = path.join(UPLOAD_DIR, 'files')

// Ensure directories exist
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true })
}

// Allowed extensions for project files
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.dwg', '.dxf',
  '.skp',
  '.rvt', '.rfa',
  '.zip', '.rar', '.7z',
  '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
]

// Multer config for project files
const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FILES_DIR),
  filename: (_req, file, cb) => {
    // Use timestamp + random suffix to prevent collisions, keep original extension
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    // Fix encoding: multer/busboy may interpret UTF-8 filenames as Latin-1
    const origName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(origName)
    cb(null, `${unique}${ext}`)
  },
})

const fileUpload = multer({
  storage: fileStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`文件类型 ${ext} 不支持`))
    }
    cb(null, true)
  },
})

const router = Router()
const PREVIEW_DIR = path.join(UPLOAD_DIR, 'previews')

// Ensure preview directory exists
if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true })
}

// Office extensions that LibreOffice can convert
const OFFICE_EXTS = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp']

// Convert Office file to PDF using LibreOffice headless
function convertToPdf(inputPath, outputDir) {
  try {
    execSync(
      `soffice --headless --norestore --nofirststartwizard --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
      { timeout: 60000, env: { ...process.env, HOME: process.env.HOME || '/tmp' } },
    )
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const pdfPath = path.join(outputDir, `${baseName}.pdf`)
    return fs.existsSync(pdfPath) ? pdfPath : null
  } catch (err) {
    console.error('LibreOffice conversion failed:', err.message)
    return null
  }
}

// GET /api/files/preview/:id — preview file (Office → PDF, images direct)
router.get('/preview/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_files WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '文件未找到' })
    const file = rows[0]
    const ext = (file.file_extension || '').toLowerCase()
    const filePath = path.join(UPLOAD_DIR, file.storage_path)

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: '文件已从磁盘中删除' })

    // Images: serve directly
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
      res.setHeader('Content-Type', file.file_type || 'image/png')
      return fs.createReadStream(filePath).pipe(res)
    }

    // PDF: serve directly
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      return fs.createReadStream(filePath).pipe(res)
    }

    // Office files: convert to PDF and serve
    if (OFFICE_EXTS.includes(ext)) {
      const pdfPath = path.join(PREVIEW_DIR, `${file.id}.pdf`)
      // Use cached PDF if recent (same file size = same content)
      if (!fs.existsSync(pdfPath)) {
        const converted = convertToPdf(filePath, PREVIEW_DIR)
        if (!converted) return res.status(500).json({ error: '文件转换失败' })
        // Rename to id-based name for caching
        if (converted !== pdfPath) fs.renameSync(converted, pdfPath)
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.original_name)}.pdf`)
      return fs.createReadStream(pdfPath).pipe(res)
    }

    // Other: download
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`)
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream')
    fs.createReadStream(filePath).pipe(res)
  } catch (err) {
    console.error('Preview error:', err)
    res.status(500).json({ error: '预览失败' })
  }
})

// ============================================================
// File Categories (protected)
// ============================================================
router.get('/categories', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM file_categories ORDER BY sort_order')
    res.json(rows)
  } catch (err) {
    console.error('GET /files/categories error:', err)
    res.status(500).json({ error: '获取文件分类失败' })
  }
})

router.post('/categories', authMiddleware, async (req, res) => {
  const { name, slug, icon } = req.body
  if (!name || !slug) return res.status(400).json({ error: 'name 和 slug 为必填项' })
  try {
    const { rows } = await query(
      'INSERT INTO file_categories (name, slug, icon) VALUES ($1,$2,$3) RETURNING *',
      [name, slug, icon || null],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /files/categories error:', err)
    res.status(500).json({ error: '创建文件分类失败' })
  }
})

router.put('/categories/:id', authMiddleware, async (req, res) => {
  const { name, slug, icon, sort_order } = req.body
  try {
    const { rows } = await query('SELECT * FROM file_categories WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '分类未找到' })
    const { rows: updated } = await query(
      `UPDATE file_categories SET name=$1, slug=$2, icon=$3, sort_order=$4 WHERE id=$5 RETURNING *`,
      [name ?? rows[0].name, slug ?? rows[0].slug, icon ?? rows[0].icon, sort_order ?? rows[0].sort_order, req.params.id],
    )
    res.json(updated[0])
  } catch (err) {
    console.error('PUT /files/categories/:id error:', err)
    res.status(500).json({ error: '更新文件分类失败' })
  }
})

router.delete('/categories/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM file_categories WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: '分类未找到' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /files/categories/:id error:', err)
    res.status(500).json({ error: '删除文件分类失败' })
  }
})

// ============================================================
// Project Files
// ============================================================

// GET /api/files/:projectId — list files for a project (public)
router.get('/:projectId', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT pf.*, fc.name as category_name, fc.icon as category_icon
       FROM project_files pf
       LEFT JOIN file_categories fc ON pf.category_id = fc.id
       WHERE pf.project_id = $1
       ORDER BY pf.sort_order, pf.created_at DESC`,
      [req.params.projectId],
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /files/:projectId error:', err)
    res.status(500).json({ error: '获取项目文件失败' })
  }
})

// POST /api/files/upload — upload file (auth required)
router.post('/upload', authMiddleware, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请选择要上传的文件' })
    const { project_id, category_id, description } = req.body
    if (!project_id) return res.status(400).json({ error: 'project_id 为必填项' })

    // Use filename from form data (reliable), fall back to multer's parsed name
    const originalName = req.body.original_name || Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(originalName).toLowerCase()

    // Get current sort_order
    const { rows: countRows } = await query(
      'SELECT COUNT(*) FROM project_files WHERE project_id = $1',
      [project_id],
    )
    const sortOrder = parseInt(countRows[0].count)

    const { rows } = await query(
      `INSERT INTO project_files
       (project_id, category_id, storage_path, original_name, file_type, file_extension, file_size_bytes, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        project_id,
        category_id || null,
        `files/${req.file.filename}`,
        originalName,
        req.file.mimetype,
        ext,
        req.file.size,
        description || null,
        sortOrder,
      ],
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /files/upload error:', err)
    res.status(500).json({ error: '文件上传失败' })
  }
})

// GET /api/files/download/:id — download file (public)
router.get('/download/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_files WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '文件未找到' })

    const file = rows[0]
    const filePath = path.join(UPLOAD_DIR, file.storage_path)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件已从磁盘中删除' })
    }

    // Set proper content-disposition for CJK filenames
    res.setHeader('Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`)
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream')
    res.setHeader('Content-Length', file.file_size_bytes)

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (err) {
    console.error('GET /files/download/:id error:', err)
    res.status(500).json({ error: '文件下载失败' })
  }
})

// PUT /api/files/:id — update file metadata (auth required)
router.put('/:id', authMiddleware, async (req, res) => {
  const { description, category_id } = req.body
  try {
    const { rows } = await query('SELECT * FROM project_files WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '文件未找到' })

    const { rows: updated } = await query(
      'UPDATE project_files SET description=$1, category_id=$2 WHERE id=$3 RETURNING *',
      [description ?? rows[0].description, category_id ?? rows[0].category_id, req.params.id],
    )
    res.json(updated[0])
  } catch (err) {
    console.error('PUT /files/:id error:', err)
    res.status(500).json({ error: '更新文件信息失败' })
  }
})

// DELETE /api/files/:id — delete file (auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM project_files WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '文件未找到' })

    const file = rows[0]
    const filePath = path.join(UPLOAD_DIR, file.storage_path)

    // Delete from DB first — if this fails, file is still recoverable
    await query('DELETE FROM project_files WHERE id = $1', [req.params.id])

    // Delete from disk
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /files/:id error:', err)
    res.status(500).json({ error: '删除文件失败' })
  }
})

export default router
