<template>
  <div class="space-y-4">
    <!-- Upload zone -->
    <div
      class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
      :class="{ 'border-gray-900 bg-gray-50': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <Icon name="lucide:upload" size="32" class="text-gray-400 mx-auto mb-3" />
      <p class="text-sm text-gray-600 font-medium">
        Drop images here or click to upload
      </p>
      <p class="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB each</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Upload progress -->
    <div v-if="isUploading" class="flex items-center gap-3 text-sm text-gray-600">
      <LoadingSpinner size="sm" />
      Uploading...
    </div>

    <!-- Image list -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="img in sortedImages"
        :key="img.id"
        :class="[
          'relative group rounded-lg overflow-hidden border-2 transition-colors',
          img.is_cover ? 'border-gray-900' : 'border-gray-200',
        ]"
      >
        <!-- Image -->
        <div class="aspect-square bg-gray-100">
          <img
            :src="getImageUrl(img.storage_path)"
            :alt="img.alt_text || ''"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Overlay actions -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <!-- Set cover -->
          <button
            v-if="!img.is_cover"
            class="p-1.5 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            title="Set as cover"
            @click="setCoverImage(img.id)"
          >
            <Icon name="lucide:star" size="14" />
          </button>

          <!-- Delete -->
          <button
            class="p-1.5 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
            @click="deleteImage(img.id)"
          >
            <Icon name="lucide:trash-2" size="14" />
          </button>
        </div>

        <!-- Cover badge -->
        <div v-if="img.is_cover" class="absolute top-2 left-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-md">
          Cover
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!isUploading"
      icon="lucide:image"
      title="No images"
      description="Upload project images above."
      wrapper-class="py-8"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/types/models'

const props = defineProps({
  projectId: { type: String, required: true },
})

const emit = defineEmits(['imagesUpdated'])

const { images, isUploading, fetchImages, uploadImage, deleteImage, setCoverImage } = useImageUpload(props.projectId)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const sortedImages = computed(() =>
  [...images.value].sort((a, b) => a.sort_order - b.sort_order),
)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) uploadFiles(Array.from(files))
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) uploadFiles(Array.from(files))
}

async function uploadFiles(files: File[]) {
  for (const file of files) {
    await uploadImage(file)
  }
}

function getImageUrl(path: string) {
  const { $supabase } = useNuxtApp()
  const { data } = $supabase.storage.from('project-images').getPublicUrl(path)
  return data.publicUrl
}

onMounted(() => fetchImages())
</script>
