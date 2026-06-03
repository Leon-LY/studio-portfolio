// Database types matching our Supabase schema
// These will be regenerated via `supabase gen types` when Supabase project is ready

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
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
