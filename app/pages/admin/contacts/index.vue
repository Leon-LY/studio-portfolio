<template>
  <div>
    <AdminHeader title="留言管理" />

    <div class="p-6">
      <!-- 筛选标签 -->
      <div class="flex items-center gap-2 mb-4">
        <button v-for="tab in tabs" :key="tab.key" class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200" :class="activeTab === tab.key ? 'bg-stone-800 text-canvas border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'" @click="activeTab = tab.key">{{ tab.label }}<span class="ml-1 opacity-60">{{ tab.count }}</span></button>
      </div>

      <div v-if="filteredContacts.length > 0" class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-100 bg-stone-50">
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 w-8" />
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3">姓名</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">联系方式</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">时间</th>
              <th class="text-right text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 w-24">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <template v-for="c in filteredContacts" :key="c.id">
              <tr class="hover:bg-stone-50 transition-colors cursor-pointer" :class="{ 'bg-amber-50/30': !c.is_read }" @click="toggleExpand(c)">
                <td class="px-4 py-3">
                  <span v-if="!c.is_read" class="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  <Icon v-else name="lucide:check" size="14" class="text-stone-300" />
                </td>
                <td class="px-4 py-3"><span class="font-medium text-stone-800">{{ c.name }}</span></td>
                <td class="px-4 py-3 hidden sm:table-cell text-stone-500 text-xs">{{ c.phone || c.email || '-' }}</td>
                <td class="px-4 py-3 hidden lg:table-cell text-xs text-stone-400">{{ formatDate(c.created_at) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button v-if="!c.is_read" class="text-xs text-accent-500 hover:text-accent-600 font-medium" @click.stop="markRead(c)">标为已读</button>
                    <button class="p-1 text-stone-300 hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors" title="删除" @click.stop="contactToDelete = c">
                      <Icon name="lucide:trash-2" size="14" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="expandedId === c.id" class="bg-stone-50">
                <td :colspan="5" class="px-6 py-4">
                  <div class="text-sm text-stone-700 whitespace-pre-wrap">{{ c.message }}</div>
                  <div class="mt-2 flex gap-4 text-xs text-stone-400">
                    <span v-if="c.phone">📞 {{ c.phone }}</span>
                    <span v-if="c.email">📧 {{ c.email }}</span>
                    <span>{{ formatDate(c.created_at) }}</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <EmptyState v-else icon="lucide:inbox" :title="activeTab === 'unread' ? '暂无未读留言' : activeTab === 'read' ? '暂无已读留言' : '暂无留言'" description="前台联系表单的留言将显示在这里。" wrapper-class="py-12" />
    </div>

    <ConfirmDialog
      v-if="contactToDelete"
      :model-value="true"
      title="删除留言"
      :message="`确定要删除 ${contactToDelete.name} 的留言吗？`"
      confirm-text="删除"
      confirm-variant="danger"
      @update:model-value="contactToDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'

interface Contact { id: string; name: string; phone: string; email: string; message: string; is_read: boolean; created_at: string }

const toast = useToast()
const contacts = ref<Contact[]>([])
const expandedId = ref<string | null>(null)
const activeTab = ref('all')
const contactToDelete = ref<Contact | null>(null)

const tabs = computed(() => [
  { key: 'all', label: '全部', count: contacts.value.length },
  { key: 'unread', label: '未读', count: contacts.value.filter(c => !c.is_read).length },
  { key: 'read', label: '已读', count: contacts.value.filter(c => c.is_read).length },
])

const filteredContacts = computed(() => {
  if (activeTab.value === 'unread') return contacts.value.filter(c => !c.is_read)
  if (activeTab.value === 'read') return contacts.value.filter(c => c.is_read)
  return contacts.value
})

onMounted(async () => {
  try { contacts.value = await adminApi.getContacts() } catch {}
})

function toggleExpand(c: Contact) { expandedId.value = expandedId.value === c.id ? null : c.id }

async function markRead(c: Contact) {
  try { await adminApi.markContactRead(c.id); c.is_read = true } catch {}
}

async function handleDelete() {
  if (!contactToDelete.value) return
  try { await adminApi.deleteContact(contactToDelete.value.id); contacts.value = contacts.value.filter(c => c.id !== contactToDelete.value.id); toast.success('已删除') } catch (e: any) { toast.error(e.message) }
  contactToDelete.value = null
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
</script>
