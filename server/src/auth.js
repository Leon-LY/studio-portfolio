import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'studio-jwt-secret-change-me'
const JWT_EXPIRES = '7d'

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
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
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Login handler
export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const { rows } = await query('SELECT * FROM admins WHERE email = $1', [email])
    const admin = rows[0]

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
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

// Create admin (for initial setup)
export async function createAdmin(req, res) {
  const { email, password, full_name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const hashed = bcrypt.hashSync(password, 10)
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
