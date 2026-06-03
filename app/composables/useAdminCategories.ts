import type { Category } from '~/types/models'

export function useAdminCategories() {
  const client = useSupabaseAdmin()

  async function fetchAll(): Promise<Category[]> {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  async function create(name: string, slug: string) {
    const { data, error } = await client
      .from('categories')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function update(id: string, updates: Partial<Category>) {
    const { error } = await client
      .from('categories')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  }

  async function remove(id: string) {
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  return { fetchAll, create, update, remove }
}
