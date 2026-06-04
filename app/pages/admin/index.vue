<template>
  <div>
    <AdminHeader title="仪表盘" />

    <div class="p-6 space-y-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-sm border border-warm-200 shadow-elevation-1">
          <p class="text-sm text-warm-500">{{ stat.label }}</p>
          <p class="mt-2 font-serif text-3xl font-bold text-warm-800">{{ stat.value }}</p>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="bg-white p-6 rounded-sm border border-warm-200 shadow-elevation-1">
        <h3 class="text-sm font-semibold text-warm-800 mb-4">快捷操作</h3>
        <div class="flex gap-3">
          <NuxtLink to="/admin/projects/new">
            <BaseButton>新建项目</BaseButton>
          </NuxtLink>
          <NuxtLink to="/admin/projects">
            <BaseButton variant="outline">查看全部项目</BaseButton>
          </NuxtLink>
        </div>
      </div>

      <!-- 最近项目 -->
      <div class="bg-white rounded-sm border border-warm-200 shadow-elevation-1">
        <div class="p-5 border-b border-warm-100">
          <h3 class="text-sm font-semibold text-warm-800">最近项目</h3>
        </div>
        <div v-if="recentProjects.length > 0" class="divide-y divide-warm-100">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="flex items-center justify-between p-4 hover:bg-warm-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-sm bg-warm-100 flex-shrink-0 overflow-hidden">
                <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="lucide:image" size="16" class="text-warm-300" />
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-warm-800">{{ project.title }}</p>
                <p class="text-xs text-warm-500">{{ formatDate(project.updated_at) }}</p>
              </div>
            </div>
            <StatusBadge :status="project.status" />
          </div>
        </div>
        <EmptyState
          v-else
          icon="lucide:folder-open"
          title="暂无项目"
          description="创建您的第一个项目以开始使用。"
          wrapper-class="py-8"
        >
          <template #action>
            <NuxtLink to="/admin/projects/new">
              <BaseButton size="sm">新建项目</BaseButton>
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
  { label: '项目总数', value: 0 },
  { label: '已发布', value: 0 },
  { label: '草稿', value: 0 },
])
const recentProjects = ref<Project[]>([])

onMounted(async () => {
  try {
    const result = await fetchProjects({ perPage: 5, sortBy: 'updated_at' })
    recentProjects.value = result.data

    const all = await Promise.all([
      fetchProjects({ status: 'draft', perPage: 1 }),
      fetchProjects({ status: 'published', perPage: 1 }),
    ])
    stats.value = [
      { label: '项目总数', value: result.count },
      { label: '已发布', value: all[1].count },
      { label: '草稿', value: all[0].count },
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
