-- Migration 002: Styles
-- Architectural styles: modern, minimalist, classical, industrial, etc.

CREATE TABLE IF NOT EXISTS styles (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read styles"
    ON styles FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can full-access styles"
    ON styles FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
