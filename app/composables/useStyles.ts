import type { Style } from '~/types/models'

export function useStyles() {
  const client = useSupabase()

  // Fetch all styles (public)
  async function fetchStyles(): Promise<Style[]> {
    const { data, error } = await client
      .from('styles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Fetch a style by slug
  async function fetchStyleBySlug(slug: string): Promise<Style | null> {
    const { data } = await client
      .from('styles')
      .select('*')
      .eq('slug', slug)
      .single()

    return data
  }

  return { fetchStyles, fetchStyleBySlug }
}
