// Centralized API client — replaces @supabase/supabase-js
// In browser: empty string → relative URL (proxied by Nginx to backend)
// In SSR/prerender: uses env API_URL set in nuxt.config.ts runtimeConfig

function getApiBase(): string {
  if (typeof window !== 'undefined') return ''
  // SSR side
  try {
    const config = useRuntimeConfig()
    return (config.public.apiUrl as string) || 'http://localhost:3001'
  } catch {
    return 'http://localhost:3001'
  }
}

function getToken(): string | null {
  if (!import.meta.client) return null
  return localStorage.getItem('studio_token')
}

function setToken(token: string) {
  if (import.meta.client) localStorage.setItem('studio_token', token)
}

function clearToken() {
  if (import.meta.client) localStorage.removeItem('studio_token')
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Public API (no auth needed)
export const api = {
  // Projects
  getProjects(params: Record<string, string | number> = {}) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)) })
    return apiFetch<any>(`/api/projects?${q.toString()}`)
  },
  getFeaturedProjects() {
    return apiFetch<any[]>('/api/projects/featured')
  },
  getProjectBySlug(slug: string) {
    return apiFetch<any>(`/api/projects/${slug}`)
  },

  // Categories
  getCategories() {
    return apiFetch<any[]>('/api/categories')
  },
  getCategoryBySlug(slug: string) {
    return apiFetch<any>(`/api/categories?slug=${slug}`)
  },

  // Styles
  getStyles() {
    return apiFetch<any[]>('/api/styles')
  },

  // Auth
  async login(email: string, password: string) {
    const result = await apiFetch<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(result.token)
    return result
  },
  logout() {
    clearToken()
  },
}

// Admin API (auth required)
export const adminApi = {
  // Projects
  getProjects(params: Record<string, string | number> = {}) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)) })
    return apiFetch<any>(`/api/projects/admin/all?${q.toString()}`)
  },
  getProject(id: string) {
    return apiFetch<any>(`/api/projects/admin/${id}`)
  },
  createProject(data: any) {
    return apiFetch<any>('/api/projects', { method: 'POST', body: JSON.stringify(data) })
  },
  updateProject(id: string, data: any) {
    return apiFetch<any>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  updateStatus(id: string, status: string) {
    return apiFetch<any>(`/api/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },
  deleteProject(id: string) {
    return apiFetch<any>(`/api/projects/${id}`, { method: 'DELETE' })
  },

  // Categories
  createCategory(data: any) {
    return apiFetch<any>('/api/categories', { method: 'POST', body: JSON.stringify(data) })
  },
  updateCategory(id: string, data: any) {
    return apiFetch<any>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteCategory(id: string) {
    return apiFetch<any>(`/api/categories/${id}`, { method: 'DELETE' })
  },

  // Styles
  createStyle(data: any) {
    return apiFetch<any>('/api/styles', { method: 'POST', body: JSON.stringify(data) })
  },
  deleteStyle(id: string) {
    return apiFetch<any>(`/api/styles/${id}`, { method: 'DELETE' })
  },

  // Images
  async uploadImage(projectId: string, file: File) {
    const token = getToken()
    const form = new FormData()
    form.append('image', file)
    form.append('project_id', projectId)
    const res = await fetch(`${API_BASE}/api/images/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(err.error)
    }
    return res.json()
  },
  deleteImage(id: string) {
    return apiFetch<any>(`/api/images/${id}`, { method: 'DELETE' })
  },
  setCoverImage(id: string) {
    return apiFetch<any>(`/api/images/${id}/cover`, { method: 'PUT' })
  },
  reorderImages(projectId: string, imageIds: string[]) {
    return apiFetch<any>('/api/images/reorder', {
      method: 'PUT',
      body: JSON.stringify({ project_id: projectId, image_ids: imageIds }),
    })
  },
}

export function getImageUrl(filename: string): string {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename // Already a full URL
  return filename.startsWith('/') ? filename : `/uploads/${filename}`
}

export { getToken, setToken, clearToken }
