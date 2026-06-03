import type { Style } from '~/types/models'

export function useAdminStyles() {
  const client = useSupabaseAdmin()

  async function fetchAll(): Promise<Style[]> {
    const { data, error } = await client
      .from('styles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  async function create(name: string, slug: string) {
    const { data, error } = await client
      .from('styles')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function update(id: string, updates: Partial<Style>) {
    const { error } = await client
      .from('styles')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  }

  async function remove(id: string) {
    const { error } = await client
      .from('styles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  return { fetchAll, create, update, remove }
}
