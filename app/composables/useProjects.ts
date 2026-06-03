import type { Project, ProjectQuery } from '~/types/models'
import { api } from './useApi'

export function useProjects() {
  async function fetchProjects(query: ProjectQuery = {}) {
    const params: Record<string, string | number> = {}
    if (query.search) params.search = query.search
    if (query.category) params.category = query.category
    if (query.style) params.style = query.style
    if (query.page) params.page = query.page
    if (query.perPage) params.perPage = query.perPage
    if (query.sortBy) params.sortBy = query.sortBy
    if (query.sortOrder) params.sortOrder = query.sortOrder
    return api.getProjects(params)
  }

  async function fetchProjectBySlug(slug: string): Promise<Project | null> {
    try {
      return await api.getProjectBySlug(slug)
    } catch {
      return null
    }
  }

  async function fetchFeaturedProjects(limit = 6): Promise<Project[]> {
    return api.getFeaturedProjects()
  }

  async function fetchRelatedProjects(categoryId: string, excludeSlug: string, limit = 4): Promise<Project[]> {
    const result = await api.getProjects({
      category: categoryId,
      perPage: limit + 1,
    })
    return (result.data || []).filter((p: any) => p.slug !== excludeSlug).slice(0, limit)
  }

  return { fetchProjects, fetchProjectBySlug, fetchFeaturedProjects, fetchRelatedProjects }
}
