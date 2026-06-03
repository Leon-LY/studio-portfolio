import type { Project, ProjectFormData, ProjectQuery, PaginatedResponse } from '~/types/models'

// Admin CRUD operations for projects (uses authenticated client)
export function useAdminProjects() {
  const client = useSupabaseAdmin()

  // Fetch all projects including draft and archived
  async function fetchProjects(query: ProjectQuery = {}): Promise<PaginatedResponse<Project>> {
    const {
      search,
      category,
      style,
      status,
      page = 1,
      perPage = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
    } = query

    let q = client
      .from('projects')
      .select('*, category:categories(*), styles:project_styles(styles(*))', { count: 'exact' })

    if (status) {
      q = q.eq('status', status)
    }

    if (search) {
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      q = q.eq('categories.slug', category)
    }

    if (style) {
      q = q.filter('project_styles.styles.slug', 'eq', style)
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, count, error } = await q
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) throw error

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

  // Fetch a single project by ID (no status filter)
  async function fetchProjectById(id: string): Promise<Project | null> {
    const { data, error } = await client
      .from('projects')
      .select('*, category:categories(*), styles:project_styles(styles(*)), images:project_images(*)')
      .eq('id', id)
      .single()

    if (error) return null

    return {
      ...data,
      styles: data.styles?.map((ps: any) => ps.styles).filter(Boolean) || [],
      images: (data.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    } as unknown as Project
  }

  // Create a new project
  async function createProject(form: ProjectFormData) {
    const { style_ids, ...projectData } = form

    // Insert project
    const { data: project, error } = await client
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) throw error

    // Insert style associations
    if (style_ids.length > 0 && project) {
      await client
        .from('project_styles')
        .insert(style_ids.map(style_id => ({ project_id: project.id, style_id })))
    }

    return project
  }

  // Update an existing project
  async function updateProject(id: string, form: ProjectFormData) {
    const { style_ids, ...projectData } = form

    const { error } = await client
      .from('projects')
      .update(projectData)
      .eq('id', id)

    if (error) throw error

    // Replace style associations (delete old, insert new)
    await client.from('project_styles').delete().eq('project_id', id)
    if (style_ids.length > 0) {
      await client
        .from('project_styles')
        .insert(style_ids.map(style_id => ({ project_id: id, style_id })))
    }

    return true
  }

  // Update project status (publish, archive, etc.)
  async function updateStatus(id: string, status: 'draft' | 'published' | 'archived') {
    const update: any = { status }
    if (status === 'archived') {
      update.archived_at = new Date().toISOString()
    } else if (status === 'published') {
      update.archived_at = null
    }

    const { error } = await client
      .from('projects')
      .update(update)
      .eq('id', id)

    if (error) throw error
    return true
  }

  // Delete a project (cascades to images and styles)
  async function deleteProject(id: string) {
    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // Auto-generate slug from title
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return {
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    updateStatus,
    deleteProject,
    generateSlug,
  }
}
