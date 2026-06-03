import type { Category } from '~/types/models'

export function useCategories() {
  const client = useSupabase()

  // Fetch all categories (public)
  async function fetchCategories(): Promise<Category[]> {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Fetch a category by slug
  async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
    const { data } = await client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    return data
  }

  return { fetchCategories, fetchCategoryBySlug }
}
