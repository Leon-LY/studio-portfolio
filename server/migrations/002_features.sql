-- ============================================================
-- Studio Portfolio — 业务功能扩展
-- 阶段1-3: 附件系统 / 回款管理 / 看板 / 变更记录 / 费用跟踪 / 文档生成
-- 执行方式:
--   docker exec -i investlearn-db psql -U postgres -d studio < server/migrations/002_features.sql
-- ============================================================

-- ============================================================
-- 1. 文件分类
-- ============================================================
CREATE TABLE file_categories (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL UNIQUE,
    slug        text NOT NULL UNIQUE,
    icon        text,
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

INSERT INTO file_categories (name, slug, icon, sort_order) VALUES
    ('合同文件', 'contract', 'lucide:file-text', 1),
    ('图纸文件', 'drawing', 'lucide:ruler', 2),
    ('汇报材料', 'report', 'lucide:presentation', 3),
    ('参考资料', 'reference', 'lucide:bookmark', 4),
    ('其他文件', 'other', 'lucide:file', 99);

-- ============================================================
-- 2. 项目附件（非图片文件）
-- ============================================================
CREATE TABLE project_files (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    category_id     uuid REFERENCES file_categories(id) ON DELETE SET NULL,
    storage_path    text NOT NULL,
    original_name   text NOT NULL,
    file_type       text NOT NULL,
    file_extension  text NOT NULL,
    file_size_bytes bigint NOT NULL,
    description     text,
    sort_order      integer DEFAULT 0,
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_project_files_project ON project_files(project_id);
CREATE INDEX idx_project_files_category ON project_files(category_id);

-- ============================================================
-- 3. 回款状态枚举 + 回款节点
-- ============================================================
CREATE TYPE milestone_status AS ENUM ('pending', 'paid', 'overdue');

CREATE TABLE payment_milestones (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id  uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title       text NOT NULL,
    amount      numeric(12,2) NOT NULL DEFAULT 0,
    due_date    date NOT NULL,
    paid_date   date,
    status      milestone_status DEFAULT 'pending' NOT NULL,
    notes       text,
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_payment_milestones_project ON payment_milestones(project_id);
CREATE INDEX idx_payment_milestones_due ON payment_milestones(due_date, status);

CREATE TRIGGER payment_milestones_updated_at
    BEFORE UPDATE ON payment_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. 项目阶段（看板列）
-- ============================================================
CREATE TABLE project_stages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    color       text DEFAULT '#808080',
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE projects ADD COLUMN stage_id uuid REFERENCES project_stages(id) ON DELETE SET NULL;

INSERT INTO project_stages (name, color, sort_order) VALUES
    ('前期接洽', '#9CA3AF', 1),
    ('方案设计', '#F59E0B', 2),
    ('扩初设计', '#3B82F6', 3),
    ('施工图设计', '#8B5CF6', 4),
    ('施工配合', '#EF4444', 5),
    ('项目竣工', '#10B981', 6);

-- ============================================================
-- 5. 变更记录
-- ============================================================
CREATE TABLE project_changes (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title           text NOT NULL,
    description     text,
    change_type     text DEFAULT 'design_change' CHECK (change_type IN ('design_change', 'scope_change', 'budget_change', 'schedule_change')),
    status          text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    confirmed_date  timestamptz,
    confirmed_by    text,
    created_by      uuid REFERENCES admins(id),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_project_changes_project ON project_changes(project_id);

CREATE TRIGGER project_changes_updated_at
    BEFORE UPDATE ON project_changes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. 费用分类 + 费用记录
-- ============================================================
CREATE TABLE expense_categories (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL UNIQUE,
    slug        text NOT NULL UNIQUE,
    sort_order  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);

INSERT INTO expense_categories (name, slug, sort_order) VALUES
    ('效果图外包', 'rendering-outsource', 1),
    ('模型制作', 'model-making', 2),
    ('差旅交通', 'travel', 3),
    ('打印装订', 'printing', 4),
    ('软件订阅', 'software', 5),
    ('其他', 'other', 99);

CREATE TABLE project_expenses (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    category_id     uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
    description     text NOT NULL,
    amount          numeric(12,2) NOT NULL,
    expense_date    date NOT NULL DEFAULT CURRENT_DATE,
    vendor          text,
    notes           text,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_project_expenses_project ON project_expenses(project_id);
CREATE INDEX idx_project_expenses_date ON project_expenses(expense_date);

CREATE TRIGGER project_expenses_updated_at
    BEFORE UPDATE ON project_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. 文档模板 + 生成历史
-- ============================================================
CREATE TABLE document_templates (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name            text NOT NULL,
    description     text,
    template_type   text NOT NULL CHECK (template_type IN ('bid', 'contract', 'quotation', 'report', 'other')),
    output_format   text NOT NULL CHECK (output_format IN ('docx', 'pptx', 'xlsx', 'pdf')),
    storage_path    text NOT NULL,
    variables_schema jsonb DEFAULT '[]'::jsonb,
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE TABLE generated_documents (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id      uuid REFERENCES projects(id) ON DELETE SET NULL,
    template_id     uuid REFERENCES document_templates(id) ON DELETE SET NULL,
    title           text NOT NULL,
    output_path     text NOT NULL,
    variables_used  jsonb DEFAULT '{}'::jsonb,
    generated_by    uuid REFERENCES admins(id),
    generated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_generated_docs_project ON generated_documents(project_id);
