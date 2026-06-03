import type { Style } from '~/types/models'
import { useStyles } from './useStyles'
import { adminApi } from './useApi'

export function useAdminStyles() {
  const { fetchStyles } = useStyles()

  async function fetchAll(): Promise<Style[]> {
    return fetchStyles()
  }

  async function create(name: string, slug: string) {
    return adminApi.createStyle({ name, slug })
  }

  async function update(id: string, updates: Partial<Style>) {
    // Styles only support name/slug, update not implemented in API yet
    return true
  }

  async function remove(id: string) {
    return adminApi.deleteStyle(id)
  }

  return { fetchAll, create, update, remove }
}
