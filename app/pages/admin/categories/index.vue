<template>
  <div>
    <AdminHeader title="分类管理" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 class="text-sm font-semibold text-stone-800">管理分类</h3>
          <BaseButton size="sm" @click="showAdd = true">添加分类</BaseButton>
        </div>

        <!-- 添加表单 -->
        <div v-if="showAdd" class="p-5 border-b border-stone-100 bg-stone-50">
          <div class="flex gap-3">
            <BaseInput v-model="newName" label="名称" placeholder="分类名称" wrapper-class="flex-1" />
            <BaseInput v-model="newSlug" label="标识符" placeholder="category-slug" wrapper-class="flex-1" />
          </div>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">保存</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false">取消</BaseButton>
          </div>
        </div>

        <!-- 列表 -->
        <div v-if="categories.length > 0" class="divide-y divide-stone-100">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-stone-800">{{ cat.name }}</p>
              <p class="text-xs text-stone-500">{{ cat.slug }}</p>
            </div>
            <button
              class="p-1.5 text-stone-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
              @click="confirmDelete = cat"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <EmptyState
          v-else
          icon="lucide:folder-tree"
          title="暂无分类"
          description="添加如住宅、商业、公共建筑等分类。"
          wrapper-class="py-8"
        />
      </div>
    </div>

    <!-- 删除确认 -->
    <ConfirmDialog
      :model-value="!!confirmDelete"
      title="删除分类"
      :message="`确定要删除分类「${confirmDelete?.name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="confirmDelete = null"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Category } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { fetchAll, create, remove } = useAdminCategories()

const categories = ref<Category[]>([])
const showAdd = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)
const confirmDelete = ref<Category | null>(null)

onMounted(async () => {
  try {
    categories.value = await fetchAll()
  } catch (e: any) {
    console.error('Failed to load categories:', e)
  }
})

async function handleAdd() {
  if (!newName.value || !newSlug.value) return
  saving.value = true
  try {
    await create(newName.value, newSlug.value)
    categories.value = await fetchAll()
    newName.value = ''
    newSlug.value = ''
    showAdd.value = false
    // Invalidate ProjectForm cache so new category appears in dropdowns
    refreshNuxtData('admin-categories')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

async function handleDeleteConfirm() {
  if (!confirmDelete.value) return
  try {
    await remove(confirmDelete.value.id)
    categories.value = await fetchAll()
    refreshNuxtData('admin-categories')
  } catch (e: any) {
    alert(e.message)
  }
  confirmDelete.value = null
}
</script>
