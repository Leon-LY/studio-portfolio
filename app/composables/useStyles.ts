import type { Style } from '~/types/models'
import { api } from './useApi'

export function useStyles() {
  async function fetchStyles(): Promise<Style[]> {
    return api.getStyles()
  }
  async function fetchStyleBySlug(slug: string): Promise<Style | null> {
    const styles = await api.getStyles()
    return styles.find((s: any) => s.slug === slug) || null
  }
  return { fetchStyles, fetchStyleBySlug }
}
