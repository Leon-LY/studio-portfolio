<template>
  <div>
    <AdminHeader title="新建项目" />

    <div class="p-6 max-w-4xl">
      <ProjectForm @submit="handleCreate" @cancel="navigateTo('/admin/projects')" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" }) 
import type { ProjectFormData } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import ProjectForm from '~/components/admin/projects/ProjectForm.vue'

const { createProject } = useAdminProjects()

async function handleCreate(form: ProjectFormData) {
  try {
    const project = await createProject(form)
    await navigateTo(`/admin/projects/${project.id}/edit?created=1`)
  } catch (e: any) {
    console.error('创建项目失败:', e)
    useToast().error(`创建项目失败：${e.message}`)
  }
}
</script>
