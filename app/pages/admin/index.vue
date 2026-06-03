<template>
  <div>
    <AdminHeader title="Dashboard" />

    <div class="p-6 space-y-6">
      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="bg-white p-5 rounded-xl border border-gray-200">
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="mt-1 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="bg-white p-5 rounded-xl border border-gray-200">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="flex gap-3">
          <NuxtLink to="/admin/projects/new">
            <BaseButton>New Project</BaseButton>
          </NuxtLink>
          <NuxtLink to="/admin/projects">
            <BaseButton variant="outline">View All Projects</BaseButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent projects -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-5 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Recent Projects</h3>
        </div>
        <div v-if="recentProjects.length > 0" class="divide-y divide-gray-100">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="lucide:image" size="16" class="text-gray-300" />
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ project.title }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(project.updated_at) }}</p>
              </div>
            </div>
            <StatusBadge :status="project.status" />
          </div>
        </div>
        <EmptyState
          v-else
          icon="lucide:folder-open"
          title="No projects yet"
          description="Create your first project to get started."
          wrapper-class="py-8"
        >
          <template #action>
            <NuxtLink to="/admin/projects/new">
              <BaseButton size="sm">New Project</BaseButton>
            </NuxtLink>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/models'

const { fetchProjects } = useAdminProjects()

const stats = ref([
  { label: 'Total Projects', value: 0 },
  { label: 'Published', value: 0 },
  { label: 'Drafts', value: 0 },
])
const recentProjects = ref<Project[]>([])

onMounted(async () => {
  try {
    const result = await fetchProjects({ perPage: 5, sortBy: 'updated_at' })
    recentProjects.value = result.data

    // Get counts by status
    const all = await Promise.all([
      fetchProjects({ status: 'draft', perPage: 1 }),
      fetchProjects({ status: 'published', perPage: 1 }),
    ])
    stats.value = [
      { label: 'Total Projects', value: result.count },
      { label: 'Published', value: all[1].count },
      { label: 'Drafts', value: all[0].count },
    ]
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
