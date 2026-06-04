// Database types matching our Supabase schema
// These will be regenerated via `supabase gen types` when Supabase project is ready

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
}

export interface Style {
  id: string
  name: string
  slug: string
  created_at: string
}

export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  category_id: string | null
  status: ProjectStatus
  completion_date: string | null
  location: string | null
  client: string | null
  area_sqm: number | null
  cover_image_url: string | null
  sort_order: number
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
  // Joined fields
  category?: Category | null
  styles?: Style[]
  images?: ProjectImage[]
}

export interface ProjectImage {
  id: string
  project_id: string
  storage_path: string
  alt_text: string | null
  caption: string | null
  sort_order: number
  is_cover: boolean
  width: number | null
  height: number | null
  created_at: string
}

export interface ProjectWithStyles {
  project_id: string
  style_id: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'editor'
  created_at: string
}

export interface SiteSetting {
  key: string
  value: any
  updated_at: string
}

// Form types for admin
export interface ProjectFormData {
  title: string
  slug: string
  description: string
  content: string
  category_id: string | null
  status: ProjectStatus
  completion_date: string | null
  location: string
  client: string
  area_sqm: number | null
  is_featured: boolean
  style_ids: string[]
  seo_title: string
  seo_description: string
}

// Query params for project list
export interface ProjectQuery {
  search?: string
  category?: string
  style?: string
  status?: ProjectStatus
  page?: number
  perPage?: number
  sortBy?: 'created_at' | 'updated_at' | 'completion_date' | 'sort_order'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  perPage: number
  totalPages: number
}

// ============================================================
// 项目附件
// ============================================================
export interface FileCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
  created_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  category_id: string | null
  storage_path: string
  original_name: string
  file_type: string
  file_extension: string
  file_size_bytes: number
  description: string | null
  sort_order: number
  created_at: string
  // Joined
  category_name?: string
  category_icon?: string
}

// ============================================================
// 回款管理
// ============================================================
export type MilestoneStatus = 'pending' | 'paid' | 'overdue'

export interface PaymentMilestone {
  id: string
  project_id: string
  title: string
  amount: number
  due_date: string
  paid_date: string | null
  status: MilestoneStatus
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  project_title?: string
}

export interface PaymentOverview {
  total_expected: number
  total_received: number
  total_overdue: number
  total_count: number
  pending_count: number
  paid_count: number
  overdue_count: number
}

// ============================================================
// 项目阶段（看板）
// ============================================================
export interface ProjectStage {
  id: string
  name: string
  color: string
  sort_order: number
}

// ============================================================
// 变更记录
// ============================================================
export type ChangeType = 'design_change' | 'scope_change' | 'budget_change' | 'schedule_change'
export type ChangeStatus = 'pending' | 'confirmed' | 'rejected'

export interface ProjectChange {
  id: string
  project_id: string
  title: string
  description: string | null
  change_type: ChangeType
  status: ChangeStatus
  confirmed_date: string | null
  confirmed_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// 费用管理
// ============================================================
export interface ExpenseCategory {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface ProjectExpense {
  id: string
  project_id: string
  category_id: string | null
  description: string
  amount: number
  expense_date: string
  vendor: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  category_name?: string
}

// ============================================================
// 文档生成
// ============================================================
export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'textarea' | 'select'
  required: boolean
  label: string
  options?: string[]
  defaultValue?: string
}

export interface DocumentTemplate {
  id: string
  name: string
  description: string | null
  template_type: 'bid' | 'contract' | 'quotation' | 'report' | 'other'
  output_format: 'docx' | 'pptx' | 'xlsx' | 'pdf'
  storage_path: string
  variables_schema: TemplateVariable[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GeneratedDocument {
  id: string
  project_id: string | null
  template_id: string | null
  title: string
  output_path: string
  variables_used: Record<string, any>
  generated_by: string | null
  generated_at: string
  template?: DocumentTemplate | null
}
