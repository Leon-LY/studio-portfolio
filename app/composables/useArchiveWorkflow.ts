// Archive workflow composable
export function useArchiveWorkflow() {
  const { updateStatus } = useAdminProjects()

  // Archive a project (published -> archived)
  async function archiveProject(id: string, _projectTitle: string) {
    await updateStatus(id, 'archived')
    return true
  }

  // Restore a project (archived -> published)
  async function restoreProject(id: string) {
    await updateStatus(id, 'published')
    return true
  }

  return {
    archiveProject,
    restoreProject,
  }
}
