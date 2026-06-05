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
    return adminApi.updateStyle(id, updates)
  }

  async function remove(id: string) {
    return adminApi.deleteStyle(id)
  }

  return { fetchAll, create, update, remove }
}
