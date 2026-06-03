-- Migration 004: Project <-> Styles (many-to-many)

CREATE TABLE IF NOT EXISTS project_styles (
    project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
    style_id    uuid REFERENCES styles(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, style_id)
);

ALTER TABLE project_styles ENABLE ROW LEVEL SECURITY;

-- Public: see styles for published projects only
CREATE POLICY "Public can read project_styles for published projects"
    ON project_styles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects WHERE id = project_id AND status = 'published'
    ));

-- Authenticated: full access
CREATE POLICY "Authenticated can full-access project_styles"
    ON project_styles FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
