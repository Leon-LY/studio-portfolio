<template>
  <div>
    <AdminHeader :title="selectedProject ? `${selectedProject.title} — 支出明细` : '支出管理'" />
    <div class="p-6">
      <!-- 项目选择 + 汇总 -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          v-model="selectedProjectId"
          class="rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600"
          @change="onProjectChange"
        >
          <option value="">选择项目...</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>

        <div class="bg-white rounded-sm border border-stone-200 p-4 flex items-center gap-3">
          <span class="text-xs text-stone-400 uppercase tracking-wider">总支出</span>
          <span class="font-serif text-xl font-bold text-stone-800">¥{{ totalExpense.toLocaleString() }}</span>
        </div>
        <div class="bg-white rounded-sm border border-stone-200 p-4 flex items-center gap-3">
          <span class="text-xs text-stone-400 uppercase tracking-wider">记录</span>
          <span class="font-serif text-xl font-bold text-stone-800">{{ filteredExpenses.length }}<span v-if="search" class="text-sm font-normal text-stone-400">/{{ expenses.length }}</span></span>
        </div>
        <button
          class="rounded-sm border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-30"
          :disabled="!selectedProjectId"
          @click="openCreate"
        >
          + 添加支出
        </button>
      </div>

      <!-- 搜索 -->
      <div v-if="selectedProjectId && expenses.length > 0" class="mb-4">
        <div class="relative max-w-xs">
          <Icon name="lucide:search" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            v-model="search"
            type="text"
            placeholder="搜索描述或分类..."
            class="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-sm bg-white placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors"
          />
        </div>
      </div>

      <!-- 未选项目 -->
      <EmptyState
        v-if="!selectedProjectId"
        icon="lucide:receipt"
        title="选择项目查看支出"
        description="请在上方下拉菜单中选择一个项目"
        wrapper-class="py-16"
      />

      <template v-else>
        <div v-if="loading" class="text-center py-12"><LoadingSpinner size="md" text="加载中..." /></div>

        <div v-else-if="expenses.length === 0" class="bg-white rounded-sm border border-stone-200">
          <EmptyState icon="lucide:banknote" title="暂无支出" wrapper-class="py-12">
            <template #action><BaseButton size="sm" @click="openCreate">添加第一笔支出</BaseButton></template>
          </EmptyState>
        </div>

        <div v-else class="bg-white rounded-sm border border-stone-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-stone-200 bg-stone-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">日期</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider hidden sm:table-cell">分类</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">描述</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">金额</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-50">
              <tr v-if="filteredExpenses.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-stone-400">没有匹配「{{ search }}」的支出记录</td>
              </tr>
              <tr v-for="e in filteredExpenses" :key="e.id" class="hover:bg-stone-50 transition-colors">
                <td class="px-4 py-3 text-stone-600 whitespace-nowrap">{{ e.expense_date?.split('T')[0] }}</td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span class="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">{{ e.category_name || '未分类' }}</span>
                </td>
                <td class="px-4 py-3 text-stone-600 max-w-[200px] truncate">{{ e.description || '-' }}</td>
                <td class="px-4 py-3 text-right font-medium text-stone-800">¥{{ Number(e.amount).toLocaleString() }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-1.5 text-stone-400 hover:text-accent-500 hover:bg-stone-100 rounded-sm transition-colors" title="编辑" @click="openEdit(e)">
                      <Icon name="lucide:pencil" size="14" />
                    </button>
                    <button class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors" title="删除" @click="expenseToDelete = e">
                      <Icon name="lucide:trash-2" size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- 添加/编辑 Modal -->
    <BaseModal v-model="showForm" :title="editingExpense ? '编辑支出' : '添加支出'" content-class="w-full max-w-sm">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">日期</label>
          <input v-model="form.expense_date" type="date" required class="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">金额 (¥)</label>
          <input v-model.number="form.amount" type="number" min="0" step="0.01" placeholder="0.00" required class="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">分类</label>
          <select v-model="form.category_id" class="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600">
            <option :value="null">未分类</option>
            <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">描述</label>
          <input v-model="form.description" type="text" placeholder="例如：效果图外包费用" class="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showForm = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingExpense ? '更新' : '保存' }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-if="expenseToDelete"
      :model-value="true"
      title="删除支出"
      :message="`确定要删除这笔 ¥${Number(expenseToDelete.amount).toLocaleString()} 的支出记录吗？`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="expenseToDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { fetchProjects } = useAdminProjects()
const toast = useToast()

const projects = ref<any[]>([])
const expenses = ref<any[]>([])
const expenseCategories = ref<any[]>([])
const selectedProjectId = ref('')
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingExpense = ref<any>(null)
const expenseToDelete = ref<any>(null)
const search = ref('')

const form = reactive({ expense_date: '', amount: 0, category_id: null as string | null, description: '' })

const selectedProject = computed(() => projects.value.find(p => p.id === selectedProjectId.value))
const totalExpense = computed(() => expenses.value.reduce((s, e) => s + Number(e.amount), 0))
const filteredExpenses = computed(() => {
  if (!search.value) return expenses.value
  const q = search.value.toLowerCase()
  return expenses.value.filter((e: any) =>
    (e.description || '').toLowerCase().includes(q) ||
    (e.category_name || '').toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try { const r = await fetchProjects({ perPage: 999 }); projects.value = r.data || [] } catch {}
  try { expenseCategories.value = await adminApi.getExpenseCategories() } catch {}
})

async function onProjectChange() {
  if (!selectedProjectId.value) { expenses.value = []; return }
  loading.value = true
  try { expenses.value = await adminApi.getExpenses(selectedProjectId.value) } catch { expenses.value = [] }
  loading.value = false
}

function resetForm() {
  form.expense_date = new Date().toISOString().split('T')[0]
  form.amount = 0
  form.category_id = null
  form.description = ''
  editingExpense.value = null
}

function openCreate() { resetForm(); showForm.value = true }
function openEdit(e: any) {
  editingExpense.value = e
  form.expense_date = e.expense_date?.split('T')[0] || ''
  form.amount = Number(e.amount)
  form.category_id = e.category_id
  form.description = e.description || ''
  showForm.value = true
}

async function handleSave() {
  if (!form.amount || !selectedProjectId.value) return
  saving.value = true
  try {
    if (editingExpense.value) {
      await adminApi.updateExpense(editingExpense.value.id, { ...form })
      toast.success('已更新')
    } else {
      await adminApi.createExpense({ ...form, project_id: selectedProjectId.value })
      toast.success('已添加')
    }
    await onProjectChange()
    showForm.value = false
    resetForm()
  } catch (e: any) {
    toast.error(e.message)
  } finally { saving.value = false }
}

async function handleDelete() {
  if (!expenseToDelete.value) return
  try {
    await adminApi.deleteExpense(expenseToDelete.value.id)
    expenses.value = expenses.value.filter(e => e.id !== expenseToDelete.value.id)
    toast.success('已删除')
  } catch (e: any) { toast.error(e.message) }
  expenseToDelete.value = null
}
</script>
