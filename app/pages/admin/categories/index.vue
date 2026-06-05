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
          <BaseInput
            v-model="newName"
            label="分类名称"
            placeholder="例如：住宅、商业、公共建筑"
            hint="标识符（slug）将根据名称自动生成"
            wrapper-class="max-w-sm"
            @input="onNameChange"
          />
          <p v-if="newSlug" class="text-xs text-stone-400 mt-2">
            标识符：<code class="bg-stone-200 px-1 py-0.5 rounded text-stone-600">{{ newSlug }}</code>
          </p>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">保存</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false; resetForm()">取消</BaseButton>
          </div>
        </div>

        <!-- 列表 -->
        <div v-if="categories.length > 0" class="divide-y divide-stone-100">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="min-w-0">
                <p class="text-sm font-medium text-stone-800">{{ cat.name }}</p>
                <p class="text-xs text-stone-500">{{ cat.slug }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <!-- 编辑按钮 -->
              <button
                class="p-1.5 text-stone-400 hover:text-accent-500 rounded-sm hover:bg-stone-100 transition-colors"
                title="编辑分类"
                @click="openEdit(cat)"
              >
                <Icon name="lucide:pencil" size="14" />
              </button>
              <!-- 首页展示开关 -->
              <button
                class="flex items-center gap-1.5 text-xs transition-colors"
                :class="cat.is_visible ? 'text-green-600' : 'text-stone-400'"
                :title="cat.is_visible ? '首页可见 — 点击隐藏' : '首页隐藏 — 点击显示'"
                @click="toggleVisibility(cat)"
              >
                <Icon :name="cat.is_visible ? 'lucide:eye' : 'lucide:eye-off'" size="14" />
                <span class="hidden sm:inline">{{ cat.is_visible ? '可见' : '隐藏' }}</span>
              </button>
              <button
                class="p-1.5 text-stone-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
                @click="confirmDelete = cat"
              >
                <Icon name="lucide:trash-2" size="16" />
              </button>
            </div>
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

    <!-- 编辑 Modal -->
    <BaseModal v-model="showEdit" title="编辑分类" content-class="w-full max-w-sm">
      <form @submit.prevent="handleEdit" class="space-y-4">
        <BaseInput v-model="editForm.name" label="名称" required />
        <BaseInput v-model="editForm.slug" label="标识符" required />
        <BaseTextarea v-model="editForm.description" label="描述" rows="2" />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showEdit = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">保存</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- 删除确认 -->
    <ConfirmDialog
      v-if="confirmDelete"
      :model-value="true"
      title="删除分类"
      :message="`确定要删除分类「${confirmDelete.name}」吗？`"
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
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'

const { fetchAll, create, update, remove } = useAdminCategories()

const categories = ref<Category[]>([])
const showAdd = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)
const confirmDelete = ref<Category | null>(null)
const showEdit = ref(false)
const editingCat = ref<Category | null>(null)
const editForm = reactive({ name: '', slug: '', description: '' })

function openEdit(cat: Category) {
  editingCat.value = cat
  editForm.name = cat.name
  editForm.slug = cat.slug
  editForm.description = cat.description || ''
  showEdit.value = true
}

async function handleEdit() {
  if (!editingCat.value) return
  saving.value = true
  try {
    await update(editingCat.value.id, editForm)
    await loadCategories()
    refreshNuxtData('admin-categories')
    showEdit.value = false
  } catch (e: any) { alert(e.message) }
  finally { saving.value = false }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'category'
}

function onNameChange() {
  newSlug.value = slugify(newName.value)
}

function resetForm() {
  newName.value = ''
  newSlug.value = ''
}

onMounted(async () => {
  try {
    categories.value = await fetchAll()
  } catch (e: any) {
    console.error('Failed to load categories:', e)
  }
})

async function toggleVisibility(cat: Category) {
  try {
    await update(cat.id, { is_visible: !cat.is_visible })
    cat.is_visible = !cat.is_visible
    refreshNuxtData('admin-categories')
  } catch (e: any) {
    alert(e.message)
  }
}

async function handleAdd() {
  if (!newName.value) return
  const slug = newSlug.value || slugify(newName.value)
  saving.value = true
  try {
    await create(newName.value, slug)
    categories.value = await fetchAll()
    resetForm()
    showAdd.value = false
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
