import type { Project, ProjectFormData, ProjectQuery } from '~/types/models'
import { adminApi } from './useApi'

export function useAdminProjects() {
  async function fetchProjects(query: ProjectQuery = {}) {
    const params: Record<string, string | number> = {}
    if (query.status) params.status = query.status
    if (query.search) params.search = query.search
    if (query.page) params.page = query.page
    if (query.perPage) params.perPage = query.perPage
    return adminApi.getProjects(params)
  }

  async function fetchProjectById(id: string): Promise<Project | null> {
    try { return await adminApi.getProject(id) } catch { return null }
  }

  async function createProject(form: ProjectFormData) {
    return adminApi.createProject(form)
  }

  async function updateProject(id: string, form: ProjectFormData) {
    return adminApi.updateProject(id, form)
  }

  async function updateStatus(id: string, status: 'draft' | 'published' | 'archived') {
    return adminApi.updateStatus(id, status)
  }

  async function deleteProject(id: string) {
    return adminApi.deleteProject(id)
  }

  function generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '')
  }

  return { fetchProjects, fetchProjectById, createProject, updateProject, updateStatus, deleteProject, generateSlug }
}
