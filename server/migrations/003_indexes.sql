-- ============================================================
-- Studio Portfolio — 性能索引
-- 执行方式:
--   docker exec -i investlearn-db psql -U investlearn -d studio < server/migrations/003_indexes.sql
-- ============================================================

-- 精选项目查询（首页高频）
CREATE INDEX IF NOT EXISTS idx_projects_featured
    ON projects(is_featured) WHERE status = 'published';

-- 项目列表排序
CREATE INDEX IF NOT EXISTS idx_projects_sort
    ON projects(sort_order, status);

-- 项目状态 + 更新时间（后台常用）
CREATE INDEX IF NOT EXISTS idx_projects_status_updated
    ON projects(status, updated_at DESC);

-- 回款状态 + 到期日期（逾期检测）
CREATE INDEX IF NOT EXISTS idx_milestones_status_due
    ON payment_milestones(status, due_date);

-- 文件按项目查询
CREATE INDEX IF NOT EXISTS idx_files_project_created
    ON project_files(project_id, created_at DESC);

-- 费用按项目+日期
CREATE INDEX IF NOT EXISTS idx_expenses_project_date
    ON project_expenses(project_id, expense_date DESC);
