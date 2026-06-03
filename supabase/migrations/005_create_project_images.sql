-- Migration 005: Project Images

CREATE TABLE IF NOT EXISTS project_images (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id   uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    storage_path text NOT NULL,
    alt_text     text,
    caption      text,
    sort_order   integer DEFAULT 0,
    is_cover     boolean DEFAULT false,
    width        integer,
    height       integer,
    created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read images for published projects"
    ON project_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE id = project_id AND status = 'published'
    ));

CREATE POLICY "Authenticated can full-access project_images"
    ON project_images FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
