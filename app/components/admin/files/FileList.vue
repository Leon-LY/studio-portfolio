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
          <tr class="border-b border-stone-200 text-left">
            <th class="py-3 px-2 font-medium text-stone-500 text-xs uppercase tracking-wider">文件</th>
            <th class="py-3 px-2 font-medium text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">分类</th>
            <th class="py-3 px-2 font-medium text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">大小</th>
            <th class="py-3 px-2 font-medium text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">上传时间</th>
            <th class="py-3 px-2 font-medium text-stone-500 text-xs uppercase tracking-wider text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in files"
            :key="file.id"
            class="border-b border-stone-100 hover:bg-stone-50 transition-colors"
          >
            <!-- File name + icon -->
            <td class="py-3 px-2">
              <div class="flex items-center gap-3">
                <FileIcon :extension="file.file_extension || ''" size="md" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-stone-800 truncate max-w-[200px] sm:max-w-xs">
                    {{ file.original_name }}
                  </p>
                  <p v-if="file.description" class="text-xs text-stone-400 truncate max-w-[200px] sm:max-w-xs">
                    {{ file.description }}
                  </p>
                </div>
              </div>
            </td>
            <!-- Category — editable inline -->
            <td class="py-3 px-2 hidden sm:table-cell">
              <select
                class="text-xs border border-stone-200 rounded-sm px-1.5 py-1 bg-white text-stone-600 focus:border-stone-400 focus:outline-none max-w-[100px]"
                :value="file.category_id || ''"
                @change="handleCategoryChange(file, $event)"
              >
                <option value="">-</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon ? '' : '' }}{{ cat.name }}
                </option>
              </select>
            </td>
            <!-- Size -->
            <td class="py-3 px-2 hidden md:table-cell text-xs text-stone-500">
              {{ formatSize(file.file_size_bytes) }}
            </td>
            <!-- Date -->
            <td class="py-3 px-2 hidden md:table-cell text-xs text-stone-500">
              {{ formatDate(file.created_at) }}
            </td>
            <!-- Actions -->
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <a
                  :href="`/api/files/download/${file.id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-1.5 text-stone-400 hover:text-accent-500 transition-colors rounded hover:bg-stone-100"
                  title="下载"
                >
                  <Icon name="lucide:download" size="16" />
                </a>
                <button
                  class="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
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
      v-if="fileToDelete"
      :model-value="showDeleteConfirm"
      title="删除文件"
      :message="`确定删除「${fileToDelete.original_name}」吗？`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="showDeleteConfirm = false"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectFile } from '~/types/models'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import FileIcon from '~/components/ui/FileIcon.vue'

defineProps({
  files: { type: Array as () => ProjectFile[], required: true },
  categories: { type: Array as () => any[], default: () => [] },
})

const emit = defineEmits(['deleted', 'update:category'])

const showDeleteConfirm = ref(false)
const fileToDelete = ref<ProjectFile | null>(null)

async function handleCategoryChange(file: ProjectFile, event: Event) {
  const select = event.target as HTMLSelectElement
  const categoryId = select.value || null
  try {
    await adminApi.updateFile(file.id, { category_id: categoryId })
    // Update local state
    file.category_id = categoryId
    emit('update:category', file)
  } catch (e: any) {
    alert(`更新分类失败：${e.message}`)
    // Revert select
    select.value = file.category_id || ''
  }
}

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
