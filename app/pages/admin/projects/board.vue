<template>
  <div>
    <AdminHeader title="项目看板" />

    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-stone-500">拖拽项目卡片切换阶段，或点击卡片上的下拉菜单快速移动</p>
        <BaseButton size="sm" variant="outline" @click="showStageMgr = true">管理阶段</BaseButton>
      </div>
      <div v-if="loading" class="flex justify-center py-12"><LoadingSpinner size="lg" text="加载中..." /></div>
      <div v-else class="flex gap-4 overflow-x-auto pb-4" style="min-height:60vh">
        <div
          v-for="stage in stages"
          :key="stage.id"
          class="flex-shrink-0 w-72 bg-stone-50 rounded-sm border-2 transition-colors duration-200 flex flex-col"
          :class="dragOverStage === stage.id ? 'border-accent-400 bg-accent-50' : 'border-stone-200'"
          @dragover.prevent="onDragOver($event, stage.id)"
          @dragenter.prevent="onDragEnter(stage.id)"
          @dragleave="onDragLeave(stage.id)"
          @drop="onDrop($event, stage.id)"
        >
          <div class="p-3 border-b border-stone-200 bg-white rounded-t-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-stone-700">{{ stage.name }}</h3>
              <span class="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">{{ stageProjects[stage.id]?.length || 0 }}</span>
            </div>
          </div>
          <div class="flex-1 p-2 space-y-2 overflow-y-auto">
            <div
              v-for="project in stageProjects[stage.id] || []"
              :key="project.id"
              class="bg-white p-3 rounded-sm border border-stone-200 hover:shadow-elevation-2 transition-all duration-200 cursor-pointer group relative"
              :class="{ 'opacity-40 scale-95': draggedProject?.id === project.id }"
              draggable="true"
              @dragstart="onDragStart($event, project)"
              @dragend="onDragEnd"
              @click="navigateTo(`/admin/projects/${project.id}/edit`)"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-sm bg-stone-100 flex-shrink-0 overflow-hidden">
                  <img v-if="project.cover_image_url" :src="project.cover_image_url" class="w-full h-full object-cover" />
                  <Icon v-else name="lucide:image" size="12" class="text-stone-300 m-auto block mt-1" />
                </div>
                <p class="text-sm font-medium text-stone-800 truncate flex-1">{{ project.title }}</p>
                <!-- 移动端回退：移至下拉菜单 -->
                <button
                  class="p-1 text-stone-300 hover:text-stone-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  title="移至其他阶段"
                  @click.stop
                  @click="showMoveMenu = project"
                >
                  <Icon name="lucide:chevron-right" size="14" />
                </button>
              </div>
              <div class="flex items-center gap-2 text-xs text-stone-400">
                <span v-if="project.client" class="truncate">{{ project.client }}</span>
                <StatusBadge :status="project.status" />
              </div>
            </div>
            <div v-if="!stageProjects[stage.id]?.length" class="text-center py-6 text-xs text-stone-400">
              {{ dragOverStage === stage.id ? '松开以移入此阶段' : '拖拽项目到此阶段' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移至阶段下拉菜单 -->
    <Teleport to="body">
      <div v-if="showMoveMenu" class="fixed inset-0 z-50" @click="showMoveMenu = null">
        <div class="absolute bg-white rounded-sm shadow-elevation-4 border border-stone-200 py-1 w-44" :style="moveMenuStyle" @click.stop>
          <p class="px-3 py-1.5 text-[10px] text-stone-400 uppercase tracking-wider">移至阶段</p>
          <button
            v-for="s in stages"
            :key="s.id"
            class="w-full text-left px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            :class="{ 'text-accent-500 font-medium': showMoveMenu.stage_id === s.id }"
            @click="moveProject(showMoveMenu, s.id)"
          >
            {{ s.name }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 阶段管理 Modal -->
    <BaseModal v-model="showStageMgr" title="管理项目阶段" content-class="w-full max-w-lg">
      <div class="space-y-3">
        <div v-for="(s, i) in stages" :key="s.id" class="flex items-center gap-3 p-2 rounded-sm hover:bg-stone-50 group">
          <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: s.color || '#78756c' }" />
          <input v-model="s.name" class="flex-1 text-sm border border-stone-200 rounded-sm px-2 py-1 focus:border-stone-400 focus:outline-none" @blur="updateStage(s)" />
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-1 text-stone-300 hover:text-stone-500 disabled:opacity-30" :disabled="i === 0" @click="moveStage(i, -1)"><Icon name="lucide:chevron-up" size="14" /></button>
            <button class="p-1 text-stone-300 hover:text-stone-500 disabled:opacity-30" :disabled="i === stages.length - 1" @click="moveStage(i, 1)"><Icon name="lucide:chevron-down" size="14" /></button>
            <button class="p-1 text-stone-300 hover:text-red-500" @click="stageToDelete = s"><Icon name="lucide:trash-2" size="14" /></button>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-stone-100">
          <BaseInput v-model="newStageName" placeholder="新阶段名称" wrapper-class="flex-1" @keyup.enter="addStage" />
          <BaseButton size="sm" @click="addStage">添加</BaseButton>
        </div>
      </div>
    </BaseModal>

    <ConfirmDialog
      v-if="stageToDelete"
      :model-value="true"
      title="删除阶段"
      :message="`确定删除阶段「${stageToDelete.name}」吗？该阶段下的项目将移至第一个阶段。`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="stageToDelete = null"
      @confirm="handleDeleteStage"
    />
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
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

interface Stage { id: string; name: string; sort_order: number }
interface ProjectRow { id: string; title: string; cover_image_url: string; client: string; status: string; stage_id: string }

const toast = useToast()
const stages = ref<Stage[]>([])
const allProjects = ref<ProjectRow[]>([])
const loading = ref(true)

const stageProjects = computed(() => {
  const map: Record<string, ProjectRow[]> = {}
  for (const s of stages.value) map[s.id] = []
  for (const p of allProjects.value) {
    const sid = p.stage_id || ''
    if (map[sid]) map[sid].push(p)
    else if (!p.stage_id && stages.value[0]) {
      map[stages.value[0].id].push(p)
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
const stageToDelete = ref<any>(null)

async function loadStages() {
  try { stages.value = await adminApi.getStages() } catch {}
}

async function addStage() {
  if (!newStageName.value.trim()) return
  try { await adminApi.createStage({ name: newStageName.value.trim() }); newStageName.value = ''; await loadStages() }
  catch (e: any) { toast.error(e.message) }
}

async function updateStage(s: any) {
  try { await adminApi.updateStage(s.id, { name: s.name }) } catch {}
}

async function handleDeleteStage() {
  if (!stageToDelete.value) return
  try { await adminApi.deleteStage(stageToDelete.value.id); await loadStages(); await loadAllProjects(); toast.success('已删除') }
  catch (e: any) { toast.error(e.message) }
  stageToDelete.value = null
}

async function moveStage(i: number, dir: number) {
  const other = stages.value[i + dir]; if (!other) return
  const ids = stages.value.map(s => s.id);
  [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
  [stages.value[i], stages.value[i + dir]] = [stages.value[i + dir], stages.value[i]];
  try { await adminApi.reorderStages(ids) } catch { await loadStages() }
}

// Drag & Drop
let draggedProject: ProjectRow | null = null
const dragOverStage = ref('')

function onDragStart(e: DragEvent, project: ProjectRow) {
  draggedProject = project
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', project.id)
  }
}

function onDragEnd() { draggedProject = null; dragOverStage.value = '' }

function onDragOver(e: DragEvent, stageId: string) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDragEnter(stageId: string) { dragOverStage.value = stageId }

function onDragLeave(stageId: string) {
  if (dragOverStage.value === stageId) dragOverStage.value = ''
}

async function onDrop(_e: DragEvent, stageId: string) {
  dragOverStage.value = ''
  if (!draggedProject) return
  try {
    await adminApi.updateProjectStage(draggedProject.id, stageId)
    draggedProject.stage_id = stageId
    allProjects.value = [...allProjects.value]
  } catch {}
  draggedProject = null
}

// Move dropdown (touch fallback)
const showMoveMenu = ref<any>(null)
const moveMenuStyle = ref({})

async function moveProject(project: ProjectRow, stageId: string) {
  try {
    await adminApi.updateProjectStage(project.id, stageId)
    project.stage_id = stageId
    allProjects.value = [...allProjects.value]
    toast.success('已移动')
  } catch (e: any) { toast.error(e.message) }
  showMoveMenu.value = null
}

// Position move menu near click
watch(showMoveMenu, (val) => {
  if (val && import.meta.client) {
    const el = document.elementFromPoint(
      window.innerWidth / 2,
      window.innerHeight / 2
    )
    moveMenuStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }
})
</script>
