<template>
  <div>
    <AdminHeader title="文件管理" />

    <div class="p-6">
      <!-- 顶部栏：项目选择 + 搜索 -->
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          v-model="selectedProjectId"
          class="w-full sm:max-w-xs rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors"
          @change="onProjectChange"
        >
          <option value="">选择项目...</option>
          <option value="__all__">全部项目</option>
          <option v-for="p in projectList" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <div v-if="allFiles.length > 0 && selectedProjectId !== '__all__'" class="relative flex-1 max-w-xs">
          <Icon name="lucide:search" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input v-model="search" type="text" placeholder="搜索文件名..." class="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-sm bg-white placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors" />
        </div>
      </div>

      <template v-if="selectedProjectId">
        <!-- 分类 + 上传（仅单个项目时） -->
        <template v-if="selectedProjectId !== '__all__'">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <button class="px-3 py-1 text-xs rounded-full border transition-colors" :class="selectedCategory === '' ? 'bg-stone-800 text-canvas border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'" @click="selectedCategory = ''">全部</button>
            <button v-for="cat in filesCategories" :key="cat.id" class="px-3 py-1 text-xs rounded-full border transition-colors" :class="selectedCategory === cat.id ? 'bg-stone-800 text-canvas border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'" @click="selectedCategory = cat.id">{{ cat.name }}</button>
          </div>
          <div class="mb-6">
            <FileUploader :project-id="selectedProjectId" :categories="filesCategories" @uploaded="handleUploaded" />
          </div>
        </template>

        <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner size="md" text="加载中..." /></div>

        <!-- 单项目：使用 FileList 组件 -->
        <div v-else-if="selectedProjectId !== '__all__'" class="bg-white rounded-sm border border-stone-200 p-4">
          <FileList :files="filteredFiles" :categories="filesCategories" @deleted="handleDelete" @update:category="handleCategoryUpdate" />
        </div>

        <!-- 全部项目：简化表格（只读浏览） -->
        <div v-else-if="filteredFiles.length > 0" class="bg-white rounded-sm border border-stone-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-stone-200 bg-stone-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">文件</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider hidden sm:table-cell">项目</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider hidden md:table-cell">分类</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-50">
              <tr v-for="f in filteredFiles" :key="f.id" class="hover:bg-stone-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <FileIcon :extension="f.file_extension" />
                    <p class="text-sm font-medium text-stone-800 truncate max-w-[300px]">{{ f.original_name }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell text-xs text-stone-500">{{ f.project_title || '-' }}</td>
                <td class="px-4 py-3 hidden md:table-cell"><span class="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">{{ f.category_name || '未分类' }}</span></td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-1.5 text-stone-400 hover:text-accent-500 hover:bg-stone-100 rounded-sm transition-colors" title="预览" @click="previewFile(f)"><Icon name="lucide:eye" size="14" /></button>
                    <button class="p-1.5 text-stone-400 hover:text-accent-500 hover:bg-stone-100 rounded-sm transition-colors" title="下载" @click="downloadFile(f)"><Icon name="lucide:download" size="14" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else icon="lucide:folder-open" title="暂无文件" wrapper-class="py-12 bg-white rounded-sm border border-stone-200 mt-4" />
      </template>

      <EmptyState v-else icon="lucide:folder-search" title="选择项目查看文件" description="选择项目或「全部项目」来查看附件。" wrapper-class="py-16" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Project, ProjectFile } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import FileIcon from '~/components/ui/FileIcon.vue'
import FileUploader from '~/components/admin/files/FileUploader.vue'
import FileList from '~/components/admin/files/FileList.vue'

const { fetchProjects: fetchAdminProjects } = useAdminProjects()
const toast = useToast()

const selectedProjectId = ref('')
const selectedCategory = ref('')
const search = ref('')
const projectList = ref<Project[]>([])
const allFiles = ref<any[]>([])
const filesCategories = ref<any[]>([])
const isLoading = ref(false)

const filteredFiles = computed(() => {
  let files = allFiles.value
  if (selectedCategory.value) files = files.filter(f => f.category_id === selectedCategory.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    files = files.filter(f => f.original_name?.toLowerCase().includes(q))
  }
  return files
})

function previewFile(f: any) {
  const ext = (f.file_extension || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    window.open(`/api/files/preview/${f.id}`, '_blank')
  } else {
    window.open(`/api/files/download/${f.id}`, '_blank')
  }
}
function downloadFile(f: any) { window.open(`/api/files/download/${f.id}`, '_blank') }

onMounted(async () => {
  try { const r = await fetchAdminProjects({ perPage: 999, sortBy: 'updated_at' }); projectList.value = r.data } catch {}
  try { filesCategories.value = await adminApi.getFileCategories() } catch {}
})

async function onProjectChange() {
  if (!selectedProjectId.value) { allFiles.value = []; return }
  isLoading.value = true
  try {
    if (selectedProjectId.value === '__all__') {
      const results = await Promise.all(
        projectList.value.map(p => adminApi.getProjectFiles(p.id).then(files =>
          files.map((f: any) => ({ ...f, project_title: p.title }))
        ).catch(() => []))
      )
      allFiles.value = results.flat()
    } else {
      const p = projectList.value.find(p => p.id === selectedProjectId.value)
      const files = await adminApi.getProjectFiles(selectedProjectId.value)
      allFiles.value = files.map((f: any) => ({ ...f, project_title: p?.title || '' }))
    }
  } catch {} finally { isLoading.value = false }
}

async function handleUploaded() { await onProjectChange() }
function handleCategoryUpdate(file: any) { onProjectChange() }
async function handleDelete(file: any) {
  try { await adminApi.deleteFile(file.id); allFiles.value = allFiles.value.filter(f => f.id !== file.id); toast.success('已删除') } catch (e: any) { toast.error(e.message) }
}
</script>
