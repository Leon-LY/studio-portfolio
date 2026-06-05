<template>
  <div>
    <AdminHeader title="风格管理" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 class="text-sm font-semibold text-stone-800">管理风格</h3>
          <BaseButton size="sm" @click="showAdd = true">添加风格</BaseButton>
        </div>

        <div v-if="showAdd" class="p-5 border-b border-stone-100 bg-stone-50">
          <BaseInput v-model="newName" label="风格名称" placeholder="例如：现代、极简、新中式" hint="标识符根据名称自动生成" wrapper-class="max-w-sm" @input="onNameChange" />
          <p v-if="newSlug" class="text-xs text-stone-400 mt-2">标识符：<code class="bg-stone-200 px-1 py-0.5 rounded text-stone-600">{{ newSlug }}</code></p>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">保存</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false; resetForm()">取消</BaseButton>
          </div>
        </div>

        <div v-if="styles.length > 0" class="divide-y divide-stone-100">
          <div v-for="s in styles" :key="s.id" class="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
            <div>
              <p class="text-sm font-medium text-stone-800">{{ s.name }}</p>
              <p class="text-xs text-stone-500">{{ s.slug }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-1.5 text-stone-400 hover:text-accent-500 rounded-sm hover:bg-stone-100 transition-colors" title="编辑" @click="openEdit(s)">
                <Icon name="lucide:pencil" size="14" />
              </button>
              <button class="p-1.5 text-stone-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors" @click="confirmDelete = s">
                <Icon name="lucide:trash-2" size="14" />
              </button>
            </div>
          </div>
        </div>

        <EmptyState v-else icon="lucide:palette" title="暂无风格" description="添加如现代、极简、新中式等风格。" wrapper-class="py-8" />
      </div>
    </div>

    <!-- Edit Modal -->
    <BaseModal v-model="showEdit" title="编辑风格" content-class="w-full max-w-sm">
      <form @submit.prevent="handleEdit" class="space-y-4">
        <BaseInput v-model="editForm.name" label="名称" required />
        <BaseInput v-model="editForm.slug" label="标识符" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showEdit = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">保存</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog v-if="confirmDelete" :model-value="true" title="删除风格" :message="`确定要删除风格「${confirmDelete.name}」吗？`" confirm-text="删除" confirm-variant="danger" @update:model-value="confirmDelete = null" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Style } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { fetchAll, create, update, remove } = useAdminStyles()

const styles = ref<Style[]>([])
const showAdd = ref(false)
const showEdit = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)
const confirmDelete = ref<Style | null>(null)
const editingStyle = ref<Style | null>(null)
const editForm = reactive({ name: '', slug: '' })

function slugify(t: string) { return t.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-+|-+$/g, '') || 'style' }
function onNameChange() { newSlug.value = slugify(newName.value) }
function resetForm() { newName.value = ''; newSlug.value = '' }

onMounted(async () => { try { styles.value = await fetchAll() } catch {} })

async function handleAdd() {
  if (!newName.value) return
  saving.value = true
  try { await create(newName.value, newSlug.value || slugify(newName.value)); styles.value = await fetchAll(); resetForm(); showAdd.value = false; refreshNuxtData('admin-styles') }
  catch (e: any) { alert(e.message) }
  finally { saving.value = false }
}

function openEdit(s: Style) { editingStyle.value = s; editForm.name = s.name; editForm.slug = s.slug; showEdit.value = true }

async function handleEdit() {
  if (!editingStyle.value) return
  saving.value = true
  try { await update(editingStyle.value.id, editForm); styles.value = await fetchAll(); refreshNuxtData('admin-styles'); showEdit.value = false }
  catch (e: any) { alert(e.message) }
  finally { saving.value = false }
}

async function handleDeleteConfirm() {
  if (!confirmDelete.value) return
  try { await remove(confirmDelete.value.id); styles.value = await fetchAll(); refreshNuxtData('admin-styles') }
  catch (e: any) { alert(e.message) }
  confirmDelete.value = null
}
</script>
