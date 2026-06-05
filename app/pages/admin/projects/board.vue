<template>
  <div>
    <AdminHeader title="项目看板" />

    <div class="p-6">
      <div v-if="loading" class="flex justify-center py-12"><LoadingSpinner size="lg" text="加载中..." /></div>
      <div v-else class="flex gap-4 overflow-x-auto pb-4" style="min-height:60vh">
        <div v-for="stage in stages" :key="stage.id" class="flex-shrink-0 w-64 bg-stone-50 rounded-sm border border-stone-200 flex flex-col">
          <div class="p-3 border-b border-stone-200 bg-white rounded-t-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-stone-700">{{ stage.name }}</h3>
              <span class="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">{{ stageProjects[stage.id]?.length || 0 }}</span>
            </div>
          </div>
          <div class="flex-1 p-2 space-y-2 overflow-y-auto" @dragover.prevent @drop="onDrop($event, stage.id)">
            <div
              v-for="project in stageProjects[stage.id] || []"
              :key="project.id"
              class="bg-white p-3 rounded-sm border border-stone-200 hover:shadow-elevation-2 transition-shadow cursor-pointer group"
              draggable="true"
              @dragstart="onDragStart($event, project)"
              @click="navigateTo(`/admin/projects/${project.id}/edit`)"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-sm bg-stone-100 flex-shrink-0 overflow-hidden">
                  <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                  <Icon v-else name="lucide:image" size="12" class="text-stone-300 m-auto block mt-1" />
                </div>
                <p class="text-sm font-medium text-stone-800 truncate">{{ project.title }}</p>
              </div>
              <div class="flex items-center gap-2 text-xs text-stone-400">
                <span v-if="project.client" class="truncate">{{ project.client }}</span>
                <StatusBadge :status="project.status" />
              </div>
            </div>
            <div v-if="!stageProjects[stage.id]?.length" class="text-center py-6 text-xs text-stone-400">
              拖拽项目到此阶段
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import StatusBadge from '~/components/admin/projects/StatusBadge.vue'

interface Stage { id: string; name: string; sort_order: number }
interface ProjectRow { id: string; title: string; cover_image_url: string; client: string; status: string; stage_id: string }

const stages = ref<Stage[]>([])
const allProjects = ref<ProjectRow[]>([])
const loading = ref(true)

const stageProjects = computed(() => {
  const map: Record<string, ProjectRow[]> = {}
  for (const s of stages.value) map[s.id] = []
  for (const p of allProjects.value) {
    const sid = p.stage_id || ''
    if (map[sid]) map[sid].push(p)
    else if (!p.stage_id) {
      // Ungrouped projects go to first stage
      const first = stages.value[0]
      if (first) map[first.id].push(p)
    }
  }
  return map
})

onMounted(async () => {
  try {
    const [s, p] = await Promise.all([
      adminApi.getStages(),
      adminApi.getProjects({ perPage: 999 }),
    ])
    stages.value = s
    allProjects.value = p.data || []
  } catch {}
  loading.value = false
})

let draggedProject: ProjectRow | null = null
function onDragStart(_e: DragEvent, project: ProjectRow) { draggedProject = project }
async function onDrop(_e: DragEvent, stageId: string) {
  if (!draggedProject) return
  try {
    await adminApi.updateProjectStage(draggedProject.id, stageId)
    draggedProject.stage_id = stageId
    allProjects.value = [...allProjects.value] // trigger reactivity
  } catch {}
  draggedProject = null
}
</script>
