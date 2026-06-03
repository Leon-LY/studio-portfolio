-- Migration 003: Projects (core table)

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS projects (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title           text NOT NULL,
    slug            text NOT NULL UNIQUE,
    description     text,
    content         text,
    category_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
    status          project_status DEFAULT 'draft' NOT NULL,
    completion_date date,
    location        text,
    client          text,
    area_sqm        numeric(10,2),
    cover_image_url text,
    sort_order      integer DEFAULT 0,
    is_featured     boolean DEFAULT false,
    seo_title       text,
    seo_description text,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    archived_at     timestamptz
);

-- Auto-update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_completion_date ON projects(completion_date);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public: only published projects
CREATE POLICY "Public can read published projects"
    ON projects FOR SELECT
    USING (status = 'published');

-- Authenticated: full access
CREATE POLICY "Authenticated can full-access projects"
    ON projects FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
