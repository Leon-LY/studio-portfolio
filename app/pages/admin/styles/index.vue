<template>
  <div>
    <AdminHeader title="风格管理" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 class="text-sm font-semibold text-stone-800">管理风格</h3>
          <BaseButton size="sm" @click="showAdd = true">添加风格</BaseButton>
        </div>

        <!-- 添加表单 -->
        <div v-if="showAdd" class="p-5 border-b border-stone-100 bg-stone-50">
          <BaseInput
            v-model="newName"
            label="风格名称"
            placeholder="例如：现代、极简、新中式"
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
        <div v-if="styles.length > 0" class="divide-y divide-stone-100">
          <div
            v-for="style in styles"
            :key="style.id"
            class="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-stone-800">{{ style.name }}</p>
              <p class="text-xs text-stone-500">{{ style.slug }}</p>
            </div>
            <button
              class="p-1.5 text-stone-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
              @click="confirmDelete = style"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <EmptyState
          v-else
          icon="lucide:palette"
          title="暂无风格"
          description="添加如现代、极简、新中式等风格。"
          wrapper-class="py-8"
        />
      </div>
    </div>

    <!-- 删除确认 -->
    <ConfirmDialog
      v-if="confirmDelete"
      :model-value="true"
      title="删除风格"
      :message="`确定要删除风格「${confirmDelete.name}」吗？`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="confirmDelete = null"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Style } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { fetchAll, create, remove } = useAdminStyles()

const styles = ref<Style[]>([])
const showAdd = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)
const confirmDelete = ref<Style | null>(null)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'style'
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
    styles.value = await fetchAll()
  } catch (e: any) {
    console.error('Failed to load styles:', e)
  }
})

async function handleAdd() {
  if (!newName.value) return
  const slug = newSlug.value || slugify(newName.value)
  saving.value = true
  try {
    await create(newName.value, slug)
    styles.value = await fetchAll()
    resetForm()
    showAdd.value = false
    refreshNuxtData('admin-styles')
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
    styles.value = await fetchAll()
    refreshNuxtData('admin-styles')
  } catch (e: any) {
    alert(e.message)
  }
  confirmDelete.value = null
}
</script>
