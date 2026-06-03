import type { Category } from '~/types/models'
import { api } from './useApi'

export function useCategories() {
  async function fetchCategories(): Promise<Category[]> {
    return api.getCategories()
  }
  async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await api.getCategories()
    return cats.find((c: any) => c.slug === slug) || null
  }
  return { fetchCategories, fetchCategoryBySlug }
}
