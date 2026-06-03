import pg from 'pg'

const { Pool } = pg

// PostgreSQL connection — uses the existing investlearn-db container
// Connect to the 'studio' database inside it
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'studio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

export function query(text, params) {
  return pool.query(text, params)
}

export function getClient() {
  return pool.connect()
}

export default pool
