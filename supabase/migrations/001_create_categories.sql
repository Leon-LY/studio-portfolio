-- Migration 001: Categories
-- Project types: residential, commercial, public, landscape, interior, etc.

CREATE TABLE IF NOT EXISTS categories (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    description text,
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public: read all categories
CREATE POLICY "Public can read categories"
    ON categories FOR SELECT
    USING (true);

-- Authenticated: full access
CREATE POLICY "Authenticated can full-access categories"
    ON categories FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
