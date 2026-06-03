import type { Project, ProjectFormData, ProjectQuery, PaginatedResponse, Category, Style } from '~/types/models'

export function useProjects() {
  const client = useSupabase()

  // Fetch paginated & filtered projects (public - only published)
  async function fetchProjects(query: ProjectQuery = {}): Promise<PaginatedResponse<Project>> {
    const {
      search,
      category,
      style,
      page = 1,
      perPage = 12,
      sortBy = 'sort_order',
      sortOrder = 'desc',
    } = query

    let q = client
      .from('projects')
      .select('*, category:categories(*), styles:project_styles(styles(*))', { count: 'exact' })
      .eq('status', 'published')

    // Search by title or description
    if (search) {
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Filter by category slug
    if (category) {
      q = q.eq('categories.slug', category)
    }

    // Filter by style slug (via join)
    if (style) {
      q = q.filter('project_styles.styles.slug', 'eq', style)
    }

    // Pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, count, error } = await q
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) throw error

    // Transform nested structure: flatten project_styles[].styles
    const projects = (data || []).map((p: any) => ({
      ...p,
      styles: p.styles?.map((ps: any) => ps.styles).filter(Boolean) || [],
    }))

    return {
      data: projects,
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    }
  }

  // Fetch a single project by slug (public - published only)
  async function fetchProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await client
      .from('projects')
      .select('*, category:categories(*), styles:project_styles(styles(*)), images:project_images(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) return null

    return {
      ...data,
      styles: data.styles?.map((ps: any) => ps.styles).filter(Boolean) || [],
      images: (data.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    } as unknown as Project
  }

  // Fetch featured projects for homepage
  async function fetchFeaturedProjects(limit = 6): Promise<Project[]> {
    const { data } = await client
      .from('projects')
      .select('*, category:categories(*), styles:project_styles(styles(*))')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('sort_order', { ascending: false })
      .limit(limit)

    return (data || []).map((p: any) => ({
      ...p,
      styles: p.styles?.map((ps: any) => ps.styles).filter(Boolean) || [],
    }))
  }

  // Related projects (same category, different project)
  async function fetchRelatedProjects(categoryId: string, excludeSlug: string, limit = 4): Promise<Project[]> {
    const { data } = await client
      .from('projects')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('slug', excludeSlug)
      .limit(limit)

    return (data || []) as Project[]
  }

  return {
    fetchProjects,
    fetchProjectBySlug,
    fetchFeaturedProjects,
    fetchRelatedProjects,
  }
}
