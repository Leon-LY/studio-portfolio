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

  async function update(_id: string, _updates: Partial<Style>) {
    throw new Error('风格更新功能尚未实现')
  }

  async function remove(id: string) {
    return adminApi.deleteStyle(id)
  }

  return { fetchAll, create, update, remove }
}
