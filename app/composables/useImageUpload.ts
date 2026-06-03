import type { ProjectImage } from '~/types/models'

export function useImageUpload(projectId: string) {
  const client = useSupabaseAdmin()

  const images = ref<ProjectImage[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  // Fetch existing images for the project
  async function fetchImages() {
    const { data } = await client
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    images.value = (data || []) as ProjectImage[]
  }

  // Upload a single image to Supabase Storage
  async function uploadImage(file: File, altText = ''): Promise<ProjectImage | null> {
    isUploading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${projectId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      // Upload to Supabase Storage
      const { error: uploadError } = await client.storage
        .from('project-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL (with optional transform)
      const { data: urlData } = client.storage
        .from('project-images')
        .getPublicUrl(fileName)

      // Get image dimensions
      const dimensions = await getImageDimensions(file)

      // Insert record into project_images table
      const sortOrder = images.value.length
      const { data: imgRecord, error: dbError } = await client
        .from('project_images')
        .insert({
          project_id: projectId,
          storage_path: fileName,
          alt_text: altText || file.name,
          sort_order: sortOrder,
          is_cover: sortOrder === 0 && images.value.length === 0, // First image is cover
          width: dimensions.width,
          height: dimensions.height,
        })
        .select()
        .single()

      if (dbError) throw dbError

      const newImage = imgRecord as ProjectImage
      images.value.push(newImage)

      return newImage
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      return null
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // Upload multiple images
  async function uploadImages(files: File[]): Promise<ProjectImage[]> {
    const results: ProjectImage[] = []
    for (const file of files) {
      const result = await uploadImage(file)
      if (result) results.push(result)
    }
    return results
  }

  // Delete an image
  async function deleteImage(imageId: string) {
    const img = images.value.find(i => i.id === imageId)
    if (!img) return

    // Remove from storage
    await client.storage.from('project-images').remove([img.storage_path])

    // Remove from database
    await client.from('project_images').delete().eq('id', imageId)

    images.value = images.value.filter(i => i.id !== imageId)

    // If deleted image was cover, set first remaining as cover
    if (img.is_cover && images.value.length > 0) {
      await setCoverImage(images.value[0].id)
    }
  }

  // Set an image as cover
  async function setCoverImage(imageId: string) {
    // Unset all covers
    await client
      .from('project_images')
      .update({ is_cover: false })
      .eq('project_id', projectId)

    // Set new cover
    await client
      .from('project_images')
      .update({ is_cover: true })
      .eq('id', imageId)

    // Update local state
    images.value = images.value.map(img => ({ ...img, is_cover: img.id === imageId }))

    // Update project cover_image_url
    const coverImg = images.value.find(i => i.id === imageId)
    if (coverImg) {
      const { data: urlData } = client.storage
        .from('project-images')
        .getPublicUrl(coverImg.storage_path)

      await client
        .from('projects')
        .update({ cover_image_url: urlData.publicUrl })
        .eq('id', projectId)
    }
  }

  // Reorder images
  async function reorderImages(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index,
    }))

    for (const update of updates) {
      await client
        .from('project_images')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    }

    // Re-sort local state
    images.value = orderedIds
      .map(id => images.value.find(i => i.id === id))
      .filter(Boolean) as ProjectImage[]
  }

  return {
    images,
    isUploading,
    uploadProgress,
    error,
    fetchImages,
    uploadImage,
    uploadImages,
    deleteImage,
    setCoverImage,
    reorderImages,
  }
}

// Get image dimensions from File object
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => resolve({ width: 0, height: 0 })
    img.src = URL.createObjectURL(file)
  })
}
