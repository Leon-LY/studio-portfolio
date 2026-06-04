<template>
  <div>
    <div v-if="!files || files.length === 0" class="py-8">
      <EmptyState
        icon="lucide:folder-open"
        title="暂无附件"
        description="上传项目相关的图纸、合同、汇报材料等文件。"
      />
    </div>

    <!-- File Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-warm-200 text-left">
            <th class="py-3 px-2 font-medium text-warm-500 text-xs uppercase tracking-wider">文件</th>
            <th class="py-3 px-2 font-medium text-warm-500 text-xs uppercase tracking-wider hidden sm:table-cell">分类</th>
            <th class="py-3 px-2 font-medium text-warm-500 text-xs uppercase tracking-wider hidden md:table-cell">大小</th>
            <th class="py-3 px-2 font-medium text-warm-500 text-xs uppercase tracking-wider hidden md:table-cell">上传时间</th>
            <th class="py-3 px-2 font-medium text-warm-500 text-xs uppercase tracking-wider text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in files"
            :key="file.id"
            class="border-b border-warm-100 hover:bg-warm-50 transition-colors"
          >
            <!-- File name + icon -->
            <td class="py-3 px-2">
              <div class="flex items-center gap-3">
                <FileIcon :extension="file.file_extension || ''" size="md" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-warm-800 truncate max-w-[200px] sm:max-w-xs">
                    {{ file.original_name }}
                  </p>
                  <p v-if="file.description" class="text-xs text-warm-400 truncate max-w-[200px] sm:max-w-xs">
                    {{ file.description }}
                  </p>
                </div>
              </div>
            </td>
            <!-- Category -->
            <td class="py-3 px-2 hidden sm:table-cell">
              <span
                v-if="file.category_name"
                class="inline-flex items-center gap-1 text-xs text-warm-500"
              >
                <Icon v-if="file.category_icon" :name="file.category_icon" size="12" />
                {{ file.category_name }}
              </span>
              <span v-else class="text-xs text-warm-300">-</span>
            </td>
            <!-- Size -->
            <td class="py-3 px-2 hidden md:table-cell text-xs text-warm-500">
              {{ formatSize(file.file_size_bytes) }}
            </td>
            <!-- Date -->
            <td class="py-3 px-2 hidden md:table-cell text-xs text-warm-500">
              {{ formatDate(file.created_at) }}
            </td>
            <!-- Actions -->
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <a
                  :href="`/api/files/download/${file.id}`"
                  target="_blank"
                  class="p-1.5 text-warm-400 hover:text-accent-500 transition-colors rounded hover:bg-warm-100"
                  title="下载"
                >
                  <Icon name="lucide:download" size="16" />
                </a>
                <button
                  class="p-1.5 text-warm-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                  title="删除"
                  @click="requestDelete(file)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="删除文件"
      :message="`确定删除「${fileToDelete?.original_name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      confirm-variant="danger"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectFile } from '~/types/models'

defineProps({
  files: { type: Array as () => ProjectFile[], required: true },
})

const emit = defineEmits(['deleted'])

const showDeleteConfirm = ref(false)
const fileToDelete = ref<ProjectFile | null>(null)

function formatSize(bytes: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function requestDelete(file: ProjectFile) {
  fileToDelete.value = file
  showDeleteConfirm.value = true
}

function handleDeleteConfirm() {
  if (fileToDelete.value) {
    emit('deleted', fileToDelete.value)
  }
  fileToDelete.value = null
}
</script>
