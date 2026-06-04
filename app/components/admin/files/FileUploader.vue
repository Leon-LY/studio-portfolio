<template>
  <div>
    <!-- Drop Zone -->
    <div
      class="border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer"
      :class="isDragging ? 'border-accent-400 bg-accent-50' : 'border-warm-300 hover:border-warm-500 bg-warm-50'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="acceptStr"
        @change="handleFileChange"
      />

      <div v-if="isUploading" class="space-y-3">
        <LoadingSpinner size="md" :text="`上传中... ${uploadProgress}%`" />
      </div>
      <div v-else>
        <Icon name="lucide:upload-cloud" size="32" class="text-warm-400 mx-auto mb-3" />
        <p class="text-sm text-warm-600 font-medium">点击或拖拽上传文件</p>
        <p class="text-xs text-warm-400 mt-1">
          支持 PDF、Word、Excel、PPT、DWG、SKP、ZIP 等格式，单文件最大 100MB
        </p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  projectId: { type: String, required: true },
  categories: { type: Array as () => any[], default: () => [] },
})

const emit = defineEmits(['uploaded'])

const { uploadFile, isUploading, error } = useProjectFiles(props.projectId)

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploadProgress = ref(0)

const acceptStr = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.skp,.rvt,.rfa,.zip,.rar,.7z,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif'

function triggerInput() {
  if (!isUploading.value) fileInput.value?.click()
}

async function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await doUpload(file)
  target.value = ''
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await doUpload(file)
}

async function doUpload(file: File) {
  uploadProgress.value = 0
  try {
    await uploadFile(file)
    uploadProgress.value = 100
    emit('uploaded')
  } catch {
    // error handled in composable
  }
}
</script>
