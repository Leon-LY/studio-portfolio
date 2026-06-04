// Project files — upload / download / delete / categorize
import type { ProjectFile, FileCategory } from '~/types/models'
import { adminApi } from './useApi'

export function useProjectFiles(projectId: string) {
  const files = ref<ProjectFile[]>([])
  const categories = ref<FileCategory[]>([])
  const isUploading = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFiles() {
    if (!projectId) return
    isLoading.value = true
    error.value = null
    try {
      files.value = await adminApi.getProjectFiles(projectId)
    } catch (e: any) {
      error.value = e.message || '加载文件失败'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategories() {
    try {
      categories.value = await adminApi.getFileCategories()
    } catch (e: any) {
      // categories not critical, fail silently
    }
  }

  async function uploadFile(file: File, metadata: { category_id?: string; description?: string } = {}) {
    isUploading.value = true
    error.value = null
    try {
      await adminApi.uploadFile(projectId, file, metadata)
      await fetchFiles()
    } catch (e: any) {
      error.value = e.message || '文件上传失败'
      throw e
    } finally {
      isUploading.value = false
    }
  }

  async function removeFile(id: string) {
    error.value = null
    try {
      await adminApi.deleteFile(id)
      files.value = files.value.filter(f => f.id !== id)
    } catch (e: any) {
      error.value = e.message || '删除文件失败'
    }
  }

  async function updateFile(id: string, data: { description?: string; category_id?: string }) {
    error.value = null
    try {
      const updated = await adminApi.updateFile(id, data)
      const idx = files.value.findIndex(f => f.id === id)
      if (idx !== -1) files.value[idx] = { ...files.value[idx], ...updated }
      return updated
    } catch (e: any) {
      error.value = e.message || '更新文件失败'
    }
  }

  function getDownloadUrl(fileId: string): string {
    return `/api/files/download/${fileId}`
  }

  // Format file size for display
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get icon name for file extension
  function getFileIcon(ext: string): string {
    const map: Record<string, string> = {
      '.pdf': 'lucide:file-text',
      '.doc': 'lucide:file-text', '.docx': 'lucide:file-text',
      '.xls': 'lucide:file-spreadsheet', '.xlsx': 'lucide:file-spreadsheet',
      '.ppt': 'lucide:presentation', '.pptx': 'lucide:presentation',
      '.dwg': 'lucide:ruler', '.dxf': 'lucide:ruler',
      '.skp': 'lucide:box',
      '.rvt': 'lucide:building', '.rfa': 'lucide:building',
      '.zip': 'lucide:archive', '.rar': 'lucide:archive', '.7z': 'lucide:archive',
      '.jpg': 'lucide:image', '.jpeg': 'lucide:image', '.png': 'lucide:image',
      '.webp': 'lucide:image', '.gif': 'lucide:image',
      '.txt': 'lucide:file', '.csv': 'lucide:file',
    }
    return map[ext.toLowerCase()] || 'lucide:file'
  }

  // Auto-fetch on creation
  if (projectId) {
    fetchFiles()
    fetchCategories()
  }

  return {
    files, categories, isUploading, isLoading, error,
    fetchFiles, fetchCategories, uploadFile, removeFile, updateFile,
    getDownloadUrl, formatFileSize, getFileIcon,
  }
}
