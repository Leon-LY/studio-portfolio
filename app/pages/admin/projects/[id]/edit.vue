<template>
  <div>
    <AdminHeader title="编辑项目" />

    <div class="p-6 max-w-4xl">
      <!-- 加载中 -->
      <div v-if="pending" class="py-12 text-center">
        <LoadingSpinner size="lg" text="加载项目中..." />
      </div>

      <!-- 未找到 -->
      <EmptyState
        v-else-if="!project"
        icon="lucide:file-question"
        title="项目未找到"
        wrapper-class="py-12"
      >
        <template #action>
          <NuxtLink to="/admin/projects">
            <BaseButton variant="outline">返回项目列表</BaseButton>
          </NuxtLink>
        </template>
      </EmptyState>

      <!-- 编辑表单 -->
      <template v-else>
        <ProjectForm :initial-data="formData" :project-id="project.id" @submit="handleUpdate" @cancel="navigateTo('/admin/projects')" />

        <!-- 图片管理 -->
        <div class="mt-10 pt-8 border-t border-warm-200">
          <h2 class="text-lg font-semibold text-warm-800 mb-4">项目图片</h2>
          <ImageManager :project-id="project.id" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectFormData } from '~/types/models'

const route = useRoute()
const { fetchProjectById, updateProject } = useAdminProjects()

const projectId = route.params.id as string

const { data: project, pending } = useAsyncData(`admin-project-${projectId}`, () => fetchProjectById(projectId))

const formData = computed<Partial<ProjectFormData>>(() => {
  if (!project.value) return {}
  return {
    title: project.value.title,
    slug: project.value.slug,
    description: project.value.description || '',
    content: project.value.content || '',
    category_id: project.value.category_id || null,
    status: project.value.status,
    completion_date: project.value.completion_date,
    location: project.value.location || '',
    client: project.value.client || '',
    area_sqm: project.value.area_sqm,
    is_featured: project.value.is_featured,
    style_ids: project.value.styles?.map(s => s.id) || [],
    seo_title: project.value.seo_title || '',
    seo_description: project.value.seo_description || '',
  }
})

async function handleUpdate(form: ProjectFormData) {
  try {
    await updateProject(projectId, form)
    refreshNuxtData(`admin-project-${projectId}`)
  } catch (e: any) {
    console.error('更新项目失败:', e)
    alert(`更新项目失败：${e.message}`)
  }
}
</script>
