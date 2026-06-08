<template>
  <div>
    <AdminHeader title="项目看板" />

    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-stone-500">拖拽项目卡片到不同阶段列即可切换阶段</p>
        <BaseButton size="sm" variant="outline" @click="showStageMgr = true">管理阶段</BaseButton>
      </div>
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

    <!-- 阶段管理 Modal -->
    <BaseModal v-model="showStageMgr" title="管理项目阶段" content-class="w-full max-w-lg">
      <div class="space-y-3">
        <div v-for="(s, i) in stages" :key="s.id" class="flex items-center gap-3 p-2 rounded-sm hover:bg-stone-50 group">
          <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: s.color || '#78756c' }" />
          <input v-model="s.name" class="flex-1 text-sm border border-stone-200 rounded-sm px-2 py-1 focus:border-stone-400 focus:outline-none" @blur="updateStage(s)" />
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-1 text-stone-300 hover:text-stone-500 disabled:opacity-30" :disabled="i === 0" @click="moveStage(i, -1)"><Icon name="lucide:chevron-up" size="14" /></button>
            <button class="p-1 text-stone-300 hover:text-stone-500 disabled:opacity-30" :disabled="i === stages.length - 1" @click="moveStage(i, 1)"><Icon name="lucide:chevron-down" size="14" /></button>
            <button class="p-1 text-stone-300 hover:text-red-500" @click="deleteStage(s)"><Icon name="lucide:trash-2" size="14" /></button>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-stone-100">
          <BaseInput v-model="newStageName" placeholder="新阶段名称" wrapper-class="flex-1" @keyup.enter="addStage" />
          <BaseButton size="sm" @click="addStage">添加</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import StatusBadge from '~/components/admin/projects/StatusBadge.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseInput from '~/components/ui/BaseInput.vue'

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

async function loadAllProjects() {
  try { const p = await adminApi.getProjects({ perPage: 999 }); allProjects.value = p.data || [] } catch {}
}

onMounted(async () => {
  try { await Promise.all([loadStages(), loadAllProjects()]) } catch {}
  loading.value = false
})

const showStageMgr = ref(false)
const newStageName = ref('')

async function loadStages() {
  try { stages.value = await adminApi.getStages() } catch {}
}

async function addStage() {
  if (!newStageName.value.trim()) return
  try { await adminApi.createStage({ name: newStageName.value.trim() }); newStageName.value = ''; await loadStages() }
  catch (e: any) { useToast().error(e.message) }
}

async function updateStage(s: any) {
  try { await adminApi.updateStage(s.id, { name: s.name }) } catch {}
}

async function deleteStage(s: any) {
  if (!confirm(`确定删除阶段「${s.name}」吗？该阶段下的项目将移至"未设置"。`)) return
  try { await adminApi.deleteStage(s.id); await loadStages(); await loadAllProjects() }
  catch (e: any) { useToast().error(e.message) }
}

async function moveStage(i: number, dir: number) {
  const other = stages.value[i + dir]; if (!other) return
  const ids = stages.value.map(s => s.id);
  [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
  [stages.value[i], stages.value[i + dir]] = [stages.value[i + dir], stages.value[i]];
  try { await adminApi.reorderStages(ids) } catch { await loadStages() }
}

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
