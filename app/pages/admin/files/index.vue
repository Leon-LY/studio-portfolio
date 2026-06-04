<template>
  <div>
    <AdminHeader title="文件管理" />

    <div class="p-6">
      <!-- Project Selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-stone-700 mb-2">选择项目</label>
        <select
          v-model="selectedProjectId"
          class="w-full max-w-md px-4 py-2.5 bg-white border border-stone-300 rounded-sm text-sm text-stone-800 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 outline-none transition-colors"
          @change="onProjectChange"
        >
          <option value="">-- 选择项目 --</option>
          <option v-for="p in projectList" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </div>

      <template v-if="selectedProjectId">
        <!-- File Categories Filter -->
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <button
            class="px-3 py-1 text-xs rounded-full border transition-colors"
            :class="selectedCategory === '' ? 'bg-stone-800 text-canvas border-stone-800' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="selectedCategory = ''"
          >
            全部
          </button>
          <button
            v-for="cat in filesCategories"
            :key="cat.id"
            class="px-3 py-1 text-xs rounded-full border transition-colors"
            :class="selectedCategory === cat.id ? 'bg-stone-800 text-canvas border-stone-800' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="selectedCategory = cat.id"
          >
            <Icon v-if="cat.icon" :name="cat.icon" size="12" class="mr-1 inline" />
            {{ cat.name }}
          </button>
        </div>

        <!-- Upload Area -->
        <div class="mb-6">
          <FileUploader :project-id="selectedProjectId" @uploaded="handleUploaded" />
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-8">
          <LoadingSpinner size="md" text="加载文件中..." />
        </div>

        <!-- File List -->
        <div v-else class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-4">
          <FileList :files="filteredFiles" @deleted="handleDelete" />
        </div>
      </template>

      <div v-else class="py-12">
        <EmptyState
          icon="lucide:folder-search"
          title="请选择一个项目"
          description="选择一个项目来查看和管理其附件。"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Project, ProjectFile } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import FileUploader from '~/components/admin/files/FileUploader.vue'
import FileList from '~/components/admin/files/FileList.vue'

const { fetchProjects: fetchAdminProjects } = useAdminProjects()

const selectedProjectId = ref('')
const selectedCategory = ref('')
const projectList = ref<Project[]>([])

// We need separate refs for the selected project's files
const allFiles = ref<ProjectFile[]>([])
const filesCategories = ref<any[]>([])
const isLoading = ref(false)

// Use composable when project changes

const filteredFiles = computed(() => {
  if (!selectedCategory.value) return allFiles.value
  return allFiles.value.filter(f => f.category_id === selectedCategory.value)
})

// Load project list
onMounted(async () => {
  try {
    const result = await fetchAdminProjects({ perPage: 999, sortBy: 'updated_at' })
    projectList.value = result.data
  } catch (e) {
    console.error('Failed to load projects:', e)
  }
})

async function onProjectChange() {
  if (!selectedProjectId.value) {
    allFiles.value = []
    return
  }
  isLoading.value = true
  try {
    const [files, cats] = await Promise.all([
      adminApi.getProjectFiles(selectedProjectId.value),
      adminApi.getFileCategories(),
    ])
    allFiles.value = files
    filesCategories.value = cats
  } catch (e: any) {
    console.error('Failed to load files:', e)
  } finally {
    isLoading.value = false
  }
}

async function handleUploaded() {
  await onProjectChange()
}

async function handleDelete(file: ProjectFile) {
  try {
    await adminApi.deleteFile(file.id)
    allFiles.value = allFiles.value.filter(f => f.id !== file.id)
  } catch (e: any) {
    alert(`删除失败: ${e.message}`)
  }
}
</script>
