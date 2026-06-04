import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = '7d'

// Require JWT_SECRET to be set — refuse to start without it
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required')
  process.exit(1)
}

// Simple in-memory rate limiter for login
const loginAttempts = new Map() // IP → { count, resetAt }
const MAX_LOGIN_ATTEMPTS = 20
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_LOGIN_ATTEMPTS) return false
  entry.count++
  return true
}

function getSecret() {
  return JWT_SECRET
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getSecret(),
    { expiresIn: JWT_EXPIRES },
  )
}

// Auth middleware — verify JWT from Authorization header
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const token = header.split(' ')[1]
    req.user = jwt.verify(token, getSecret())
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Login handler
export async function login(req, res) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: '登录尝试过于频繁，请 15 分钟后再试' })
  }

  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const { rows } = await query('SELECT * FROM admins WHERE email = $1', [email])
    const admin = rows[0]

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(admin)
    res.json({
      token,
      user: { id: admin.id, email: admin.email, full_name: admin.full_name, role: admin.role },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}

// Create admin (open for initial setup, then requires auth)
export async function createAdmin(req, res) {
  const { email, password, full_name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    // If admins already exist, this endpoint requires authentication
    const { rows: existing } = await query('SELECT COUNT(*) FROM admins')
    if (parseInt(existing[0].count) > 0) {
      // Check for valid auth token
      const header = req.headers.authorization
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized — admin setup already completed' })
      }
      try {
        jwt.verify(header.split(' ')[1], getSecret())
      } catch {
        return res.status(401).json({ error: 'Invalid token' })
      }
    }

    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await query(
      'INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashed, full_name || '', 'admin'],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Admin with this email already exists' })
    }
    console.error('Create admin error:', err)
    res.status(500).json({ error: 'Failed to create admin' })
  }
}
