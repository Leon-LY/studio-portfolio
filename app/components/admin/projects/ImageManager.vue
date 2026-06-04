<template>
  <div class="space-y-4">
    <!-- 上传区域 -->
    <div
      class="border-2 border-dashed border-warm-300 rounded-sm p-8 text-center hover:border-warm-400 transition-colors cursor-pointer bg-warm-50"
      :class="{ 'border-accent-400 bg-accent-50': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <Icon name="lucide:upload" size="32" class="text-warm-400 mx-auto mb-3" />
      <p class="text-sm text-warm-600 font-medium">
        拖放图片到此处或点击上传
      </p>
      <p class="text-xs text-warm-400 mt-1">支持 PNG、JPG、WebP，单文件不超过 10MB</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- 上传进度 -->
    <div v-if="isUploading" class="flex items-center gap-3 text-sm text-warm-600">
      <LoadingSpinner size="sm" />
      上传中...
    </div>

    <!-- 图片列表 -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="img in sortedImages"
        :key="img.id"
        :class="[
          'relative group rounded-sm overflow-hidden border-2 transition-colors',
          img.is_cover ? 'border-accent-400' : 'border-warm-200',
        ]"
      >
        <!-- 图片 -->
        <div class="aspect-square bg-warm-100">
          <img
            :src="getImageUrl(img.storage_path)"
            :alt="img.alt_text || ''"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- 悬停操作层 -->
        <div class="absolute inset-0 bg-warm-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <!-- 设为封面 -->
          <button
            v-if="!img.is_cover"
            class="p-1.5 bg-white rounded-sm text-warm-700 hover:bg-warm-50 transition-colors"
            title="设为封面"
            @click="setCoverImage(img.id)"
          >
            <Icon name="lucide:star" size="14" />
          </button>

          <!-- 删除 -->
          <button
            class="p-1.5 bg-white rounded-sm text-red-600 hover:bg-red-50 transition-colors"
            title="删除"
            @click="deleteImage(img.id)"
          >
            <Icon name="lucide:trash-2" size="14" />
          </button>
        </div>

        <!-- 封面标签 -->
        <div v-if="img.is_cover" class="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-xs rounded-sm">
          封面
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!isUploading"
      icon="lucide:image"
      title="暂无图片"
      description="使用上方区域上传项目图片。"
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
  if (path.startsWith('/uploads/') || path.startsWith('http')) return path
  return `/uploads/${path}`
}

onMounted(() => fetchImages())
</script>
