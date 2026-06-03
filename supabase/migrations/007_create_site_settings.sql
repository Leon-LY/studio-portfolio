-- Migration 007: Site Settings (key-value store)

CREATE TABLE IF NOT EXISTS site_settings (
    key         text PRIMARY KEY,
    value       jsonb NOT NULL DEFAULT '""'::jsonb,
    updated_at  timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can full-access site_settings"
    ON site_settings FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
    ('site_name', '"Architecture Studio"'),
    ('site_description', '"Architecture & Design Studio Portfolio"'),
    ('contact_email', '""'),
    ('social_links', '{}'),
    ('hero_headline', '"We Design Spaces"'),
    ('hero_subheadline', '"Architecture that inspires"')
ON CONFLICT (key) DO NOTHING;
