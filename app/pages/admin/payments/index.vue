<template>
  <div>
    <AdminHeader title="回款管理" />

    <div class="p-6 space-y-6">
      <!-- Tab Bar -->
      <div class="flex items-center gap-1 bg-stone-100 rounded-sm p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-2 text-sm font-medium rounded-sm transition-colors"
          :class="activeTab === tab.key ? 'bg-white text-stone-800 shadow-elevation-1' : 'text-stone-500 hover:text-stone-700'"
          @click="activeTab = tab.key"
        >
          <Icon :name="tab.icon" size="16" class="mr-1.5 inline" />
          {{ tab.label }}
        </button>
      </div>

      <!-- List View -->
      <template v-if="activeTab === 'list'">
        <!-- Project Selector -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">选择项目</label>
          <select
            v-model="selectedProjectId"
            class="w-full max-w-md px-4 py-2.5 bg-white border border-stone-300 rounded-sm text-sm text-stone-800 focus:border-stone-600 focus:ring-1 focus:ring-stone-600 outline-none transition-colors"
            @change="loadMilestones"
          >
            <option value="">-- 选择项目 --</option>
            <option v-for="p in projectList" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>

        <template v-if="selectedProjectId">
          <!-- Summary -->
          <div v-if="milestones.length > 0" class="flex items-center gap-6 p-4 bg-stone-50 rounded-sm border border-stone-200 text-sm">
            <span class="text-stone-500">共 <strong class="text-stone-800">{{ milestones.length }}</strong> 个节点</span>
            <span class="text-stone-500">合计：<strong class="text-stone-800">{{ formatAmount(totalAmount) }}</strong></span>
            <span class="text-green-600">已收：<strong>{{ formatAmount(paidAmount) }}</strong></span>
            <span v-if="overdueCount > 0" class="text-red-500">逾期：<strong>{{ overdueCount }} 笔</strong></span>
          </div>

          <!-- List -->
          <div v-if="isLoading" class="py-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
          <div v-else class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-4">
            <div class="flex justify-end mb-3">
              <BaseButton size="sm" @click="openCreateForm">
                <Icon name="lucide:plus" size="16" class="mr-1" /> 新增回款节点
              </BaseButton>
            </div>
            <PaymentList
              :milestones="milestones"
              @edit="openEditForm"
              @delete="handleDelete"
              @mark-paid="handleMarkPaid"
            />
          </div>
        </template>

        <div v-else class="py-12">
          <EmptyState
            icon="lucide:receipt-text"
            title="请选择一个项目"
            description="选择项目后查看和管理回款节点。"
          />
        </div>
      </template>

      <!-- Calendar View -->
      <template v-if="activeTab === 'calendar'">
        <PaymentCalendar @edit="openEditForm" />
      </template>

      <!-- Payment Form Modal -->
      <PaymentForm
        v-model="showForm"
        :milestone="editingMilestone"
        :project-id="selectedProjectId"
        @saved="handleSaved"
      />

      <!-- Delete Confirmation -->
      <ConfirmDialog
        v-if="deletingMilestone"
        :model-value="showDeleteConfirm"
        title="删除回款节点"
        :message="`确定要删除「${deletingMilestone.title}」吗？`"
        confirm-text="删除"
        confirm-variant="danger"
        @update:model-value="showDeleteConfirm = false"
        @confirm="handleDeleteConfirm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Project, PaymentMilestone } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import PaymentList from '~/components/admin/payments/PaymentList.vue'
import PaymentCalendar from '~/components/admin/payments/PaymentCalendar.vue'
import PaymentForm from '~/components/admin/payments/PaymentForm.vue'

const { fetchProjects: fetchAdminProjects } = useAdminProjects()
const {
  milestones, totalAmount, paidAmount, overdueCount, isLoading, error,
  fetchMilestones, createMilestone, updateMilestone, updateStatus, removeMilestone,
} = usePayments()

const tabs = [
  { key: 'list', label: '列表视图', icon: 'lucide:list' },
  { key: 'calendar', label: '日历视图', icon: 'lucide:calendar' },
]
const activeTab = ref('list')

const selectedProjectId = ref('')
const projectList = ref<Project[]>([])
const showForm = ref(false)
const showDeleteConfirm = ref(false)
const editingMilestone = ref<PaymentMilestone | null>(null)
const deletingMilestone = ref<PaymentMilestone | null>(null)

onMounted(async () => {
  try {
    const result = await fetchAdminProjects({ perPage: 999, sortBy: 'updated_at' })
    projectList.value = result.data
  } catch (e) {
    console.error('Failed to load projects:', e)
  }
})

async function loadMilestones() {
  if (selectedProjectId.value) await fetchMilestones(selectedProjectId.value)
}

function openCreateForm() {
  editingMilestone.value = null
  showForm.value = true
}

function openEditForm(m: PaymentMilestone) {
  editingMilestone.value = m
  showForm.value = true
}

async function handleSaved(data: any) {
  try {
    if (editingMilestone.value) {
      await updateMilestone(editingMilestone.value.id, data)
    } else {
      await createMilestone(data)
    }
    showForm.value = false
  } catch (e: any) {
    alert(`操作失败: ${e.message}`)
  }
}

function handleDelete(m: PaymentMilestone) {
  deletingMilestone.value = m
  showDeleteConfirm.value = true
}

async function handleDeleteConfirm() {
  if (deletingMilestone.value) {
    await removeMilestone(deletingMilestone.value.id)
    deletingMilestone.value = null
  }
}

async function handleMarkPaid(m: PaymentMilestone) {
  try {
    await updateStatus(m.id, 'paid')
  } catch (e: any) {
    alert(`操作失败: ${e.message}`)
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}
</script>
