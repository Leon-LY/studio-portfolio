import type { Category } from '~/types/models'
import { useCategories } from './useCategories'
import { adminApi } from './useApi'

export function useAdminCategories() {
  const { fetchCategories } = useCategories()

  async function fetchAll(): Promise<Category[]> {
    return fetchCategories()
  }

  async function create(name: string, slug: string) {
    return adminApi.createCategory({ name, slug })
  }

  async function update(id: string, updates: Partial<Category>) {
    return adminApi.updateCategory(id, updates)
  }

  async function remove(id: string) {
    return adminApi.deleteCategory(id)
  }

  return { fetchAll, create, update, remove }
}
