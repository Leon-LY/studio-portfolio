<template>
  <div>
    <AdminHeader title="留言管理" />

    <div class="p-6 max-w-4xl">
      <div v-if="contacts.length > 0" class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-100 bg-stone-50">
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 w-8">状态</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3">姓名</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">邮箱</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">项目类型</th>
              <th class="text-left text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">时间</th>
              <th class="text-right text-xs font-medium text-stone-400 uppercase tracking-wider px-4 py-3 w-20">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <template v-for="c in contacts" :key="c.id">
              <tr class="hover:bg-stone-50 transition-colors cursor-pointer" :class="{ 'bg-amber-50/30': !c.is_read }" @click="toggleExpand(c)">
                <td class="px-4 py-3">
                  <span v-if="!c.is_read" class="inline-block w-2 h-2 rounded-full bg-amber-500" title="未读" />
                  <Icon v-else name="lucide:check" size="14" class="text-stone-300" />
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium text-stone-800">{{ c.name }}</span>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell text-stone-500">{{ c.email }}</td>
                <td class="px-4 py-3 hidden md:table-cell text-stone-500">{{ c.project_type || '-' }}</td>
                <td class="px-4 py-3 hidden lg:table-cell text-xs text-stone-400">{{ formatDate(c.created_at) }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="!c.is_read"
                    class="text-xs text-accent-500 hover:text-accent-600 font-medium"
                    @click.stop="markRead(c)"
                  >标为已读</button>
                  <span v-else class="text-xs text-stone-300">已读</span>
                </td>
              </tr>
              <!-- 展开的留言内容 -->
              <tr v-if="expandedId === c.id" class="bg-stone-50">
                <td colspan="6" class="px-6 py-4">
                  <div class="text-sm text-stone-700 whitespace-pre-wrap">{{ c.message }}</div>
                  <div class="mt-2 flex gap-4 text-xs text-stone-400">
                    <span>邮箱：<a :href="`mailto:${c.email}`" class="text-accent-500 hover:underline">{{ c.email }}</a></span>
                    <span v-if="c.project_type">项目类型：{{ c.project_type }}</span>
                    <span>{{ formatDate(c.created_at) }}</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        icon="lucide:inbox"
        title="暂无留言"
        description="前台联系表单的留言将显示在这里。"
        wrapper-class="py-12"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import EmptyState from '~/components/ui/EmptyState.vue'

interface Contact { id: string; name: string; email: string; project_type: string; message: string; is_read: boolean; created_at: string }

const contacts = ref<Contact[]>([])
const expandedId = ref<string | null>(null)

onMounted(async () => {
  try { contacts.value = await adminApi.getContacts() } catch {}
})

function toggleExpand(c: Contact) { expandedId.value = expandedId.value === c.id ? null : c.id }

async function markRead(c: Contact) {
  try {
    await adminApi.markContactRead(c.id)
    c.is_read = true
  } catch {}
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
</script>
