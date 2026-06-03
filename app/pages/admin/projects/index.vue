<template>
  <div>
    <AdminHeader title="Projects" />

    <div class="p-6">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <!-- Status tabs -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ]"
            @click="activeTab = tab.value; loadProjects()"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Search + New -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <Icon name="lucide:search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search..."
              class="w-48 pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              @input="onSearchChange"
            />
          </div>
          <NuxtLink to="/admin/projects/new">
            <BaseButton size="sm">New Project</BaseButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Project table -->
      <div v-if="projects.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Updated</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Icon name="lucide:image" size="16" class="text-gray-300" />
                    </div>
                  </div>
                  <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ project.title }}</p>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span v-if="project.category" class="text-sm text-gray-500">{{ project.category.name }}</span>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :status="project.status" />
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="text-sm text-gray-500">{{ formatDate(project.updated_at) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <NuxtLink :to="`/admin/projects/${project.id}/edit`">
                    <BaseButton variant="ghost" size="sm">Edit</BaseButton>
                  </NuxtLink>

                  <!-- Archive / Restore -->
                  <template v-if="project.status === 'published'">
                    <BaseButton variant="ghost" size="sm" @click="handleArchive(project)">
                      Archive
                    </BaseButton>
                  </template>
                  <template v-else-if="project.status === 'archived'">
                    <BaseButton variant="ghost" size="sm" @click="handleRestore(project)">
                      Restore
                    </BaseButton>
                  </template>

                  <!-- Delete -->
                  <BaseButton variant="ghost" size="sm" @click="confirmDelete = project">
                    <Icon name="lucide:trash-2" size="14" class="text-red-500" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <EmptyState
        v-else
        icon="lucide:folder-open"
        title="No projects"
        :description="activeTab === 'all' ? 'Create your first project.' : `No ${activeTab} projects.`"
      >
        <template #action>
          <NuxtLink to="/admin/projects/new">
            <BaseButton>New Project</BaseButton>
          </NuxtLink>
        </template>
      </EmptyState>

      <!-- Pagination -->
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

    <!-- Delete confirmation -->
    <ConfirmDialog
      :model-value="!!confirmDelete"
      title="Delete Project"
      :message="`Are you sure you want to delete \`${confirmDelete?.title}\`? This cannot be undone.`"
      confirm-text="Delete"
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
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Archived', value: 'archived' },
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
