-- Migration 005: Add is_visible to categories
-- Run: docker exec -i investlearn-db psql -U investlearn -d studio < server/migrations/005_category_visible.sql

ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Update existing categories to be visible
UPDATE categories SET is_visible = true WHERE is_visible IS NULL;
