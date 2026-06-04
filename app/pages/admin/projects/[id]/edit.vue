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

      <!-- 编辑界面 -->
      <template v-else>
        <!-- Tab Bar -->
        <div class="flex items-center gap-1 bg-stone-100 rounded-sm p-1 w-fit mb-6 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-4 py-2 text-sm font-medium rounded-sm transition-colors whitespace-nowrap"
            :class="activeTab === tab.key ? 'bg-white text-stone-800 shadow-elevation-1' : 'text-stone-500 hover:text-stone-700'"
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" size="16" class="mr-1.5 inline" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: 基本信息 -->
        <div v-if="activeTab === 'info'">
          <ProjectForm :initial-data="formData" :project-id="project.id" @submit="handleUpdate" @cancel="navigateTo('/admin/projects')" />
        </div>

        <!-- Tab: 图片管理 -->
        <div v-if="activeTab === 'images'">
          <ImageManager :project-id="project.id" />
        </div>

        <!-- Tab: 项目文件 -->
        <div v-if="activeTab === 'files'" class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-4">
          <FileUploader :project-id="project.id" @uploaded="refreshFiles" />
          <div v-if="fileLoading" class="py-4 text-center">
            <LoadingSpinner size="sm" text="加载文件中..." />
          </div>
          <div v-else class="mt-4">
            <FileList :files="projectFiles" @deleted="handleFileDelete" />
          </div>
        </div>

        <!-- Tab: 回款节点 -->
        <div v-if="activeTab === 'payments'" class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-4">
          <div class="flex justify-between items-center mb-4">
            <div v-if="paymentMilestones.length > 0" class="flex items-center gap-6 text-sm">
              <span class="text-stone-500">合计：<strong class="text-stone-800">{{ formatAmount(pmtTotal) }}</strong></span>
              <span class="text-green-600">已收：<strong>{{ formatAmount(pmtPaid) }}</strong></span>
            </div>
            <BaseButton size="sm" @click="openPaymentForm">
              <Icon name="lucide:plus" size="16" class="mr-1" /> 新增回款节点
            </BaseButton>
          </div>
          <div v-if="pmtLoading" class="py-4 text-center">
            <LoadingSpinner size="sm" text="加载回款节点..." />
          </div>
          <PaymentList
            v-else
            :milestones="paymentMilestones"
            @edit="openEditPaymentForm"
            @delete="handlePaymentDelete"
            @mark-paid="handleMarkPaid"
          />
        </div>
      </template>
    </div>

    <!-- Payment Form Modal -->
    <PaymentForm
      v-model="showPaymentForm"
      :milestone="editingMilestone"
      :project-id="project?.id || ''"
      @saved="handlePaymentSaved"
    />

    <!-- Payment Delete Confirm -->
    <ConfirmDialog
      v-model="showPmtDeleteConfirm"
      title="删除回款节点"
      :message="`确定删除「${deletingMilestone?.title}」吗？`"
      confirm-text="删除"
      confirm-variant="danger"
      @confirm="handlePaymentDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Project, ProjectFormData, ProjectFile, PaymentMilestone } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import ProjectForm from '~/components/admin/projects/ProjectForm.vue'
import ImageManager from '~/components/admin/projects/ImageManager.vue'
import FileUploader from '~/components/admin/files/FileUploader.vue'
import FileList from '~/components/admin/files/FileList.vue'
import PaymentList from '~/components/admin/payments/PaymentList.vue'
import PaymentForm from '~/components/admin/payments/PaymentForm.vue'

const route = useRoute()
const { fetchProjectById, updateProject } = useAdminProjects()

const projectId = route.params.id as string

const { data: project, pending } = useAsyncData(`admin-project-${projectId}`, () => fetchProjectById(projectId))

// Tabs
const tabs = [
  { key: 'info', label: '基本信息', icon: 'lucide:file-text' },
  { key: 'images', label: '图片管理', icon: 'lucide:image' },
  { key: 'files', label: '项目文件', icon: 'lucide:folder-open' },
  { key: 'payments', label: '回款节点', icon: 'lucide:receipt' },
]
const activeTab = ref('info')

// Form data
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

// ============================================================
// Files management
// ============================================================
const projectFiles = ref<ProjectFile[]>([])
const fileLoading = ref(false)

async function loadFiles() {
  if (!projectId) return
  fileLoading.value = true
  try {
    projectFiles.value = await adminApi.getProjectFiles(projectId)
  } catch (e: any) {
    console.error('Failed to load files:', e)
  } finally {
    fileLoading.value = false
  }
}

async function refreshFiles() {
  await loadFiles()
}

async function handleFileDelete(file: ProjectFile) {
  try {
    await adminApi.deleteFile(file.id)
    projectFiles.value = projectFiles.value.filter(f => f.id !== file.id)
  } catch (e: any) {
    alert(`删除失败: ${e.message}`)
  }
}

// Load files when tab is activated
watch(activeTab, (tab) => {
  if (tab === 'files' && projectFiles.value.length === 0) loadFiles()
  if (tab === 'payments' && paymentMilestones.value.length === 0) loadPaymentMilestones()
})

// ============================================================
// Payments management
// ============================================================
const paymentMilestones = ref<PaymentMilestone[]>([])
const pmtLoading = ref(false)
const showPaymentForm = ref(false)
const showPmtDeleteConfirm = ref(false)
const editingMilestone = ref<PaymentMilestone | null>(null)
const deletingMilestone = ref<PaymentMilestone | null>(null)

const pmtTotal = computed(() => paymentMilestones.value.reduce((s, m) => s + Number(m.amount), 0))
const pmtPaid = computed(() => paymentMilestones.value.filter(m => m.status === 'paid').reduce((s, m) => s + Number(m.amount), 0))

async function loadPaymentMilestones() {
  if (!projectId) return
  pmtLoading.value = true
  try {
    paymentMilestones.value = await adminApi.getMilestones(projectId)
  } catch (e: any) {
    console.error('Failed to load milestones:', e)
  } finally {
    pmtLoading.value = false
  }
}

function openPaymentForm() {
  editingMilestone.value = null
  showPaymentForm.value = true
}

function openEditPaymentForm(m: PaymentMilestone) {
  editingMilestone.value = m
  showPaymentForm.value = true
}

async function handlePaymentSaved(data: any) {
  try {
    if (editingMilestone.value) {
      const updated = await adminApi.updateMilestone(editingMilestone.value.id, data)
      const idx = paymentMilestones.value.findIndex(m => m.id === editingMilestone.value!.id)
      if (idx !== -1) paymentMilestones.value[idx] = updated
    } else {
      const created = await adminApi.createMilestone({ ...data, project_id: projectId })
      paymentMilestones.value = [...paymentMilestones.value, created]
    }
    showPaymentForm.value = false
  } catch (e: any) {
    alert(`操作失败: ${e.message}`)
  }
}

function handlePaymentDelete(m: PaymentMilestone) {
  deletingMilestone.value = m
  showPmtDeleteConfirm.value = true
}

async function handlePaymentDeleteConfirm() {
  if (deletingMilestone.value) {
    try {
      await adminApi.deleteMilestone(deletingMilestone.value.id)
      paymentMilestones.value = paymentMilestones.value.filter(m => m.id !== deletingMilestone.value!.id)
    } catch (e: any) {
      alert(`删除失败: ${e.message}`)
    }
    deletingMilestone.value = null
  }
}

async function handleMarkPaid(m: PaymentMilestone) {
  try {
    const updated = await adminApi.updateMilestoneStatus(m.id, 'paid')
    const idx = paymentMilestones.value.findIndex(p => p.id === m.id)
    if (idx !== -1) paymentMilestones.value[idx] = updated
  } catch (e: any) {
    alert(`操作失败: ${e.message}`)
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}
</script>
