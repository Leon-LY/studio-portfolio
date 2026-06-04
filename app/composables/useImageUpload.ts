import type { ProjectImage } from '~/types/models'
import { adminApi, getImageUrl } from './useApi'

export function useImageUpload(projectId: string) {
  const images = ref<ProjectImage[]>([])
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  async function fetchImages() {
    try {
      const project = await adminApi.getProject(projectId)
      images.value = (project.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
    } catch { /* keep existing images on error */ }
  }

  async function uploadImage(file: File, _altText = ''): Promise<ProjectImage | null> {
    isUploading.value = true
    error.value = null
    try {
      const result = await adminApi.uploadImage(projectId, file)
      images.value.push(result)
      return result
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      return null
    } finally {
      isUploading.value = false
    }
  }

  async function deleteImage(imageId: string) {
    await adminApi.deleteImage(imageId)
    images.value = images.value.filter(i => i.id !== imageId)
  }

  async function setCoverImage(imageId: string) {
    await adminApi.setCoverImage(imageId)
    images.value = images.value.map(img => ({ ...img, is_cover: img.id === imageId }))
  }

  async function reorderImages(orderedIds: string[]) {
    await adminApi.reorderImages(projectId, orderedIds)
    images.value = orderedIds
      .map(id => images.value.find(i => i.id === id))
      .filter(Boolean) as ProjectImage[]
  }

  return { images, isUploading, error, fetchImages, uploadImage, deleteImage, setCoverImage, reorderImages, getImageUrl }
}
