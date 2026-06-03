import { adminApi } from './useApi'

export function useArchiveWorkflow() {
  async function archiveProject(id: string, _projectTitle: string) {
    await adminApi.updateStatus(id, 'archived')
    return true
  }
  async function restoreProject(id: string) {
    await adminApi.updateStatus(id, 'published')
    return true
  }
  return { archiveProject, restoreProject }
}
