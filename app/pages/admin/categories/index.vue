<template>
  <div>
    <AdminHeader title="分类管理" />
    <div class="p-6">
      <div class="flex gap-6 items-start">
        <!-- 左侧列表 -->
        <div class="flex-1 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
          <div class="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div>
              <h3 class="text-sm font-semibold text-stone-800">分类列表</h3>
              <p class="text-xs text-stone-400 mt-0.5">共 {{ categories.length }} 个分类，{{ categories.filter(c => c.is_visible).length }} 个在首页显示</p>
            </div>
            <BaseButton size="sm" @click="showAdd = true">添加分类</BaseButton>
          </div>
          <div v-if="showAdd" class="px-5 py-4 border-b border-stone-100 bg-stone-50">
            <BaseInput v-model="newName" label="分类名称" placeholder="例如：住宅、商业、公共建筑" hint="标识符根据名称自动生成" @input="onNameChange" />
            <p v-if="newSlug" class="text-xs text-stone-400 mt-1.5">标识符：<code class="bg-stone-200 px-1 py-0.5 rounded text-stone-600">{{ newSlug }}</code></p>
            <div class="flex gap-2 mt-3">
              <BaseButton size="sm" :loading="saving" @click="handleAdd">保存</BaseButton>
              <BaseButton size="sm" variant="outline" @click="showAdd = false; resetForm()">取消</BaseButton>
            </div>
          </div>
          <div v-if="categories.length > 0" class="divide-y divide-stone-50">
            <div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Icon :name="catIcons[cat.slug] || 'lucide:folder'" size="18" class="text-stone-400" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-stone-800">{{ cat.name }}</p>
                  <p class="text-xs text-stone-400">{{ cat.slug }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button class="p-1.5 text-stone-400 hover:text-stone-600 rounded-sm hover:bg-stone-100 transition-colors" :title="cat.is_visible ? '首页可见' : '首页隐藏'" @click="toggleVisibility(cat)">
                  <Icon :name="cat.is_visible ? 'lucide:eye' : 'lucide:eye-off'" size="15" :class="cat.is_visible ? 'text-green-500' : 'text-stone-300'" />
                </button>
                <button class="p-1.5 text-stone-400 hover:text-accent-500 rounded-sm hover:bg-stone-100 transition-colors" title="编辑" @click="openEdit(cat)">
                  <Icon name="lucide:pencil" size="14" />
                </button>
                <button class="p-1.5 text-stone-400 hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors" title="删除" @click="confirmDelete = cat">
                  <Icon name="lucide:trash-2" size="14" />
                </button>
              </div>
            </div>
          </div>
          <EmptyState v-else icon="lucide:folder-tree" title="暂无分类" description="添加如住宅、商业、公共建筑等分类" wrapper-class="py-10" />
        </div>

        <!-- 右侧统计面板 -->
        <div class="w-64 flex-shrink-0 space-y-4 hidden lg:block">
          <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-5">
            <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">使用说明</h4>
            <ul class="text-xs text-stone-500 space-y-2.5">
              <li class="flex gap-2"><span class="text-green-500 mt-0.5">👁</span> 点击眼睛切换首页显示</li>
              <li class="flex gap-2"><span class="text-accent-500 mt-0.5">✏</span> 铅笔图标编辑名称</li>
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">🗑</span> 垃圾桶图标删除分类</li>
            </ul>
          </div>
          <div class="bg-stone-50 rounded-sm border border-stone-200 p-5">
            <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">首页可见</h4>
            <div v-for="cat in categories.filter(c => c.is_visible)" :key="cat.id" class="text-xs text-stone-600 py-1 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              {{ cat.name }}
            </div>
            <p v-if="categories.filter(c => c.is_visible).length === 0" class="text-xs text-stone-400">暂无可见分类</p>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="showEdit" title="编辑分类" content-class="w-full max-w-sm">
      <form @submit.prevent="handleEdit" class="space-y-4">
        <BaseInput v-model="editForm.name" label="名称" required />
        <BaseInput v-model="editForm.slug" label="标识符" required />
        <BaseTextarea v-model="editForm.description" label="描述" :rows="2" />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showEdit = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">保存</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog v-if="confirmDelete" :model-value="true" title="删除分类" :message="`确定要删除分类「${confirmDelete.name}」吗？`" confirm-text="删除" confirm-variant="danger" @update:model-value="confirmDelete = null" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { Category } from '~/types/models'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const { fetchAll, create, update, remove } = useAdminCategories()
const categories = ref<Category[]>([])
const showAdd = ref(false); const showEdit = ref(false)
const newName = ref(''); const newSlug = ref('')
const saving = ref(false); const confirmDelete = ref<Category | null>(null)
const editingCat = ref<Category | null>(null)
const editForm = reactive({ name: '', slug: '', description: '' })

const catIcons: Record<string, string> = { residential: 'lucide:home', commercial: 'lucide:building-2', public: 'lucide:landmark', landscape: 'lucide:trees', cultural: 'lucide:museum', education: 'lucide:school', healthcare: 'lucide:heart-pulse', hospitality: 'lucide:coffee', office: 'lucide:briefcase', renovation: 'lucide:wrench' }

function slugify(t: string) { return t.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-+|-+$/g, '') || 'category' }
function onNameChange() { newSlug.value = slugify(newName.value) }
function resetForm() { newName.value = ''; newSlug.value = '' }

async function loadCategories() { try { categories.value = await fetchAll() } catch {} }
onMounted(() => loadCategories())

async function handleAdd() {
  if (!newName.value) return; saving.value = true
  try { await create(newName.value, newSlug.value || slugify(newName.value)); await loadCategories(); resetForm(); showAdd.value = false; refreshNuxtData('admin-categories') }
  catch (e: any) { alert(e.message) } finally { saving.value = false }
}
function openEdit(cat: Category) { editingCat.value = cat; editForm.name = cat.name; editForm.slug = cat.slug; editForm.description = cat.description || ''; showEdit.value = true }
async function handleEdit() {
  if (!editingCat.value) return; saving.value = true
  try { await update(editingCat.value.id, editForm); await loadCategories(); refreshNuxtData('admin-categories'); showEdit.value = false }
  catch (e: any) { alert(e.message) } finally { saving.value = false }
}
async function toggleVisibility(cat: Category) { try { await update(cat.id, { is_visible: !cat.is_visible }); cat.is_visible = !cat.is_visible; refreshNuxtData('admin-categories') } catch (e: any) { alert(e.message) } }
async function handleDeleteConfirm() { if (!confirmDelete.value) return; try { await remove(confirmDelete.value.id); await loadCategories(); refreshNuxtData('admin-categories') } catch (e: any) { alert(e.message) } confirmDelete.value = null }
</script>
