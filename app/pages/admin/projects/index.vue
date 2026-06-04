<template>
  <div>
    <AdminHeader title="项目管理" />

    <div class="p-6">
      <!-- 工具栏 -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <!-- 状态标签页 -->
        <div class="flex gap-1 bg-warm-100 p-1 rounded-sm">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
              activeTab === tab.value
                ? 'bg-white text-warm-800 shadow-elevation-1'
                : 'text-warm-500 hover:text-warm-700',
            ]"
            @click="activeTab = tab.value; loadProjects()"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 搜索 + 新建 -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <Icon name="lucide:search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              v-model="search"
              type="text"
              placeholder="搜索..."
              class="w-48 pl-9 pr-3 py-1.5 text-sm border border-warm-300 rounded-sm focus:border-warm-600 focus:outline-none focus:ring-1 focus:ring-warm-600"
              @input="onSearchChange"
            />
          </div>
          <NuxtLink to="/admin/projects/new">
            <BaseButton size="sm">新建项目</BaseButton>
          </NuxtLink>
        </div>
      </div>

      <!-- 项目表格 -->
      <div v-if="projects.length > 0" class="bg-white rounded-sm border border-warm-200 shadow-elevation-1 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-warm-100">
              <th class="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-4 py-3">项目</th>
              <th class="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">分类</th>
              <th class="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-4 py-3">状态</th>
              <th class="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">更新于</th>
              <th class="text-right text-xs font-medium text-warm-400 uppercase tracking-wider px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-warm-50">
            <tr v-for="project in projects" :key="project.id" class="hover:bg-warm-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-sm bg-warm-100 flex-shrink-0 overflow-hidden">
                    <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Icon name="lucide:image" size="16" class="text-warm-300" />
                    </div>
                  </div>
                  <p class="text-sm font-medium text-warm-800 line-clamp-1">{{ project.title }}</p>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span v-if="project.category" class="text-sm text-warm-500">{{ project.category.name }}</span>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :status="project.status" />
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="text-sm text-warm-500">{{ formatDate(project.updated_at) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <NuxtLink :to="`/admin/projects/${project.id}/edit`">
                    <BaseButton variant="ghost" size="sm">编辑</BaseButton>
                  </NuxtLink>

                  <template v-if="project.status === 'published'">
                    <BaseButton variant="ghost" size="sm" @click="handleArchive(project)">
                      归档
                    </BaseButton>
                  </template>
                  <template v-else-if="project.status === 'archived'">
                    <BaseButton variant="ghost" size="sm" @click="handleRestore(project)">
                      恢复
                    </BaseButton>
                  </template>

                  <BaseButton variant="ghost" size="sm" @click="confirmDelete = project">
                    <Icon name="lucide:trash-2" size="14" class="text-red-500" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else
        icon="lucide:folder-open"
        title="暂无项目"
        :description="activeTab === 'all' ? '创建您的第一个项目。' : `暂无${tabs.find(t => t.value === activeTab)?.label}项目。`"
      >
        <template #action>
          <NuxtLink to="/admin/projects/new">
            <BaseButton>新建项目</BaseButton>
          </NuxtLink>
        </template>
      </EmptyState>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center gap-2">
        <BaseButton
          v-for="p in totalPages"
          :key="p"
          :variant="page === p ? 'primary' : 'outline'"
          size="sm"
          @click="page = p; loadProjects()"
        >
          {{ p }}
        </BaseButton>
      </div>
    </div>

    <!-- 删除确认 -->
    <ConfirmDialog
      :model-value="!!confirmDelete"
      title="删除项目"
      :message="`确定要删除「${confirmDelete?.title}」吗？此操作无法撤销。`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="confirmDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectStatus } from '~/types/models'

const { fetchProjects, updateStatus, deleteProject } = useAdminProjects()
const { archiveProject, restoreProject } = useArchiveWorkflow()

const tabs = [
  { label: '全部', value: 'all' },
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '已归档', value: 'archived' },
]

const activeTab = ref('all')
const search = ref('')
const page = ref(1)
const projects = ref<Project[]>([])
const totalPages = ref(0)
const confirmDelete = ref<Project | null>(null)

let searchTimer: ReturnType<typeof setTimeout>

function onSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadProjects() }, 300)
}

async function loadProjects() {
  try {
    const result = await fetchProjects({
      status: activeTab.value === 'all' ? undefined : (activeTab.value as ProjectStatus),
      search: search.value || undefined,
      page: page.value,
      perPage: 20,
    })
    projects.value = result.data
    totalPages.value = result.totalPages
  } catch (e) {
    console.error('Failed to load projects:', e)
  }
}

async function handleArchive(project: Project) {
  await archiveProject(project.id, project.title)
  await loadProjects()
}

async function handleRestore(project: Project) {
  await restoreProject(project.id)
  await loadProjects()
}

async function handleDelete() {
  if (confirmDelete.value) {
    await deleteProject(confirmDelete.value.id)
    confirmDelete.value = null
    await loadProjects()
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => loadProjects())
watch(activeTab, () => { page.value = 1; loadProjects() })
</script>
