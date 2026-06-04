-- Migration 004: Contacts table for contact form submissions
-- Run: docker exec -i investlearn-db psql -U postgres -d studio < server/migrations/004_contacts.sql

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts (is_read);
