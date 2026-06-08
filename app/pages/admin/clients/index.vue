<template>
  <div>
    <AdminHeader title="客户管理" />
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <p class="text-sm text-stone-500">共 {{ clients.length }} 个客户</p>
        <BaseButton size="sm" @click="openCreate">添加客户</BaseButton>
      </div>

      <!-- 客户列表 -->
      <div v-if="clients.length > 0" class="bg-white rounded-sm border border-stone-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-200 bg-stone-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">客户名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider hidden md:table-cell">联系人</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider hidden sm:table-cell">电话/邮箱</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">关联项目</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="c in clients" :key="c.id" class="hover:bg-stone-50 transition-colors cursor-pointer" @click="expandedId = expandedId === c.id ? null : c.id">
              <td class="px-4 py-3">
                <p class="font-medium text-stone-800">{{ c.name }}</p>
                <p v-if="c.address" class="text-xs text-stone-400 mt-0.5">{{ c.address }}</p>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-stone-600">{{ c.contact_person || '-' }}</td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="text-stone-600 text-xs space-y-0.5">
                  <p v-if="c.phone">{{ c.phone }}</p>
                  <p v-if="c.email" class="text-stone-400">{{ c.email }}</p>
                  <p v-if="!c.phone && !c.email" class="text-stone-400">-</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium"
                    :class="c.project_count > 0 ? 'bg-accent-100 text-accent-600' : 'bg-stone-100 text-stone-400'"
                  >{{ c.project_count }}</span>
                  <span v-if="c.project_count > 0" class="text-stone-400 text-xs">个</span>
                  <span v-else class="text-stone-400 text-xs">暂无</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button class="p-1.5 text-stone-400 hover:text-accent-500 hover:bg-stone-100 rounded-sm transition-colors" title="编辑" @click="openEdit(c)">
                    <Icon name="lucide:pencil" size="14" />
                  </button>
                  <button class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors" title="删除" @click="clientToDelete = c">
                    <Icon name="lucide:trash-2" size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <!-- 展开的项目列表 -->
            <tr v-if="expandedId" class="bg-stone-50" :class="clients.find(c => c.id === expandedId)?.project_count > 0 ? '' : 'hidden'">
              <td :colspan="5" class="px-6 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <NuxtLink
                    v-for="p in clients.find(c => c.id === expandedId)?.projects || []"
                    :key="p.id"
                    :to="`/projects/${p.slug || ''}`"
                    target="_blank"
                    class="px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-full text-stone-600 hover:text-accent-500 hover:border-accent-300 transition-colors"
                  >
                    {{ p.title }}
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else icon="lucide:users" title="暂无客户" wrapper-class="py-16 bg-white rounded-sm border border-stone-200" />
    </div>

    <!-- 添加/编辑 Modal -->
    <BaseModal v-model="showForm" :title="editingClient ? '编辑客户' : '添加客户'" content-class="w-full max-w-md">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseInput v-model="form.name" label="客户名称" placeholder="例如：万科集团" required />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.contact_person" label="联系人" placeholder="姓名" />
          <BaseInput v-model="form.phone" label="电话" placeholder="手机号" />
        </div>
        <BaseInput v-model="form.email" label="邮箱" type="email" placeholder="email@example.com" />
        <BaseInput v-model="form.address" label="地址" placeholder="公司或项目地址" />
        <BaseTextarea v-model="form.notes" label="备注" :rows="2" placeholder="其他备注信息..." />
        <!-- 关联项目 -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">关联项目</label>
          <div v-if="allProjects.length > 0" class="max-h-36 overflow-y-auto space-y-1 border border-stone-200 rounded-sm p-2">
            <label v-for="p in allProjects" :key="p.id" class="flex items-center gap-2 py-0.5 cursor-pointer text-sm text-stone-600 hover:text-stone-800">
              <input type="checkbox" :value="p.id" v-model="selectedProjectIds" class="w-4 h-4 rounded-sm border-stone-300 text-stone-800 focus:ring-stone-500" />
              {{ p.title }}
            </label>
          </div>
          <p v-else class="text-xs text-stone-400">暂无项目</p>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="outline" type="button" @click="showForm = false">取消</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingClient ? '更新' : '保存' }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      v-if="clientToDelete"
      :model-value="true"
      title="删除客户"
      :message="`确定要删除客户「${clientToDelete.name}」吗？关联的项目将取消客户归属。`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="clientToDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

const toast = useToast()
const { fetchProjects } = useAdminProjects()
const clients = ref<any[]>([])
const allProjects = ref<any[]>([])
const showForm = ref(false)
const saving = ref(false)
const editingClient = ref<any>(null)
const clientToDelete = ref<any>(null)
const expandedId = ref<string | null>(null)
const selectedProjectIds = ref<string[]>([])
const form = reactive({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' })

async function loadClients() {
  try { clients.value = await adminApi.getClients() } catch {}
}
onMounted(async () => {
  await loadClients()
  try { const r = await fetchProjects({ perPage: 999 }); allProjects.value = r.data || [] } catch {}
})

function resetForm() {
  Object.assign(form, { name: '', contact_person: '', phone: '', email: '', address: '', notes: '' })
  editingClient.value = null
  selectedProjectIds.value = []
}
function openCreate() { resetForm(); showForm.value = true }
function openEdit(c: any) {
  editingClient.value = c
  Object.assign(form, { name: c.name, contact_person: c.contact_person || '', phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' })
  selectedProjectIds.value = (c.projects || []).map((p: any) => p.id)
  showForm.value = true
}

async function handleSave() {
  if (!form.name) return
  saving.value = true
  try {
    const data = { ...form, project_ids: selectedProjectIds.value }
    if (editingClient.value) {
      await adminApi.updateClient(editingClient.value.id, data)
      toast.success('已更新')
    } else {
      await adminApi.createClient(data)
      toast.success('已添加')
    }
    showForm.value = false
    resetForm()
    await loadClients()
  } catch (e: any) { toast.error(e.message) } finally { saving.value = false }
}

async function handleDelete() {
  if (!clientToDelete.value) return
  try { await adminApi.deleteClient(clientToDelete.value.id); await loadClients(); toast.success('已删除') } catch (e: any) { toast.error(e.message) }
  clientToDelete.value = null
}
</script>
