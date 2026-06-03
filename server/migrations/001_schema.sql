-- ============================================================
-- Studio Portfolio — 数据库初始化
-- 在现有的 investlearn-db PostgreSQL 中创建
-- 执行方式:
--   docker exec -i investlearn-db psql -U postgres < server/migrations/001_schema.sql
-- ============================================================

-- 创建独立数据库（不影响 investlearn）
CREATE DATABASE studio;

-- 切换到 studio 数据库
\c studio

-- ============================================================
-- 分类表
-- ============================================================
CREATE TABLE categories (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    description text,
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 风格表
-- ============================================================
CREATE TABLE styles (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 项目状态枚举
-- ============================================================
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');

-- ============================================================
-- 项目表
-- ============================================================
CREATE TABLE projects (
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

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category_id);

-- ============================================================
-- 项目↔风格 多对多
-- ============================================================
CREATE TABLE project_styles (
    project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
    style_id    uuid REFERENCES styles(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, style_id)
);

-- ============================================================
-- 项目图片
-- ============================================================
CREATE TABLE project_images (
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

CREATE INDEX idx_project_images_project ON project_images(project_id);

-- ============================================================
-- 管理员表
-- ============================================================
CREATE TABLE admins (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email        text NOT NULL UNIQUE,
    password     text NOT NULL,
    full_name    text,
    role         text DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- 站点设置
-- ============================================================
CREATE TABLE site_settings (
    key         text PRIMARY KEY,
    value       jsonb NOT NULL DEFAULT '""'::jsonb,
    updated_at  timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
    ('site_name', '"Architecture Studio"'),
    ('site_description', '"Architecture & Design Studio Portfolio"')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 存储过程：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
