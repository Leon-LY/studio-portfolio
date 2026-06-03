<template>
  <div>
    <AdminHeader title="New Project" />

    <div class="p-6 max-w-4xl">
      <ProjectForm @submit="handleCreate" @cancel="navigateTo('/admin/projects')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectFormData } from '~/types/models'

const { createProject } = useAdminProjects()

async function handleCreate(form: ProjectFormData) {
  try {
    const project = await createProject(form)
    await navigateTo(`/admin/projects/${project.id}/edit`)
  } catch (e: any) {
    console.error('Failed to create project:', e)
    alert(`Failed to create project: ${e.message}`)
  }
}
</script>
