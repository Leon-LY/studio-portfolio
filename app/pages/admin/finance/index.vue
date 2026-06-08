<template>
  <div>
    <AdminHeader title="收支总览" />
    <div class="p-6">
      <!-- 汇总卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-sm border border-stone-200 p-5">
          <p class="text-xs text-stone-400 uppercase tracking-wider">预计收入</p>
          <p class="mt-2 font-serif text-2xl font-bold text-stone-800">¥{{ totals.expected.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-sm border border-stone-200 p-5">
          <p class="text-xs text-stone-400 uppercase tracking-wider">已收</p>
          <p class="mt-2 font-serif text-2xl font-bold text-green-700">¥{{ totals.received.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-sm border border-stone-200 p-5">
          <p class="text-xs text-stone-400 uppercase tracking-wider">总支出</p>
          <p class="mt-2 font-serif text-2xl font-bold text-red-600">¥{{ totals.expenses.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-sm border border-stone-200 p-5">
          <p class="text-xs text-stone-400 uppercase tracking-wider">净利润</p>
          <p class="mt-2 font-serif text-2xl font-bold" :class="totals.profit >= 0 ? 'text-stone-800' : 'text-red-600'">¥{{ totals.profit.toLocaleString() }}</p>
        </div>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="text-center py-12"><LoadingSpinner size="md" text="加载中..." /></div>

      <!-- 项目列表 -->
      <div v-else class="bg-white rounded-sm border border-stone-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-200 bg-stone-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">项目</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">预计收入</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider hidden sm:table-cell">已收</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider hidden sm:table-cell">支出</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">利润</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="p in projects" :key="p.id" class="hover:bg-stone-50 transition-colors">
              <td class="px-4 py-3">
                <NuxtLink :to="`/admin/projects/${p.id}/edit`" class="font-medium text-stone-800 hover:text-accent-500 transition-colors">{{ p.title }}</NuxtLink>
                <span class="ml-2 px-1.5 py-0.5 text-[10px] rounded-sm" :class="p.status === 'published' ? 'bg-green-100 text-green-600' : p.status === 'archived' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'">{{ statusLabel(p.status) }}</span>
              </td>
              <td class="px-4 py-3 text-right text-stone-600">¥{{ Number(p.expected_income).toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-green-700 hidden sm:table-cell">¥{{ Number(p.received_income).toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-red-600 hidden sm:table-cell">¥{{ Number(p.total_expenses).toLocaleString() }}</td>
              <td class="px-4 py-3 text-right font-semibold" :class="Number(p.profit) >= 0 ? 'text-green-700' : 'text-red-600'">¥{{ Number(p.profit).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const projects = ref<any[]>([])
const loading = ref(true)

const totals = computed(() => ({
  expected: projects.value.reduce((s, p) => s + Number(p.expected_income), 0),
  received: projects.value.reduce((s, p) => s + Number(p.received_income), 0),
  expenses: projects.value.reduce((s, p) => s + Number(p.total_expenses), 0),
  profit: projects.value.reduce((s, p) => s + Number(p.profit), 0),
}))

function statusLabel(s: string) { return { published: '已发布', draft: '草稿', archived: '已归档' }[s] || s }

onMounted(async () => {
  try { projects.value = await adminApi.getFinancialSummary() } catch {}
  loading.value = false
})
</script>
