<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
    <div class="bg-white p-6 rounded-sm border border-stone-200 shadow-elevation-1">
      <p class="text-sm text-stone-500">预计回款总额</p>
      <p class="mt-2 font-serif text-2xl font-bold text-stone-800">{{ formatAmount(overview?.total_expected || 0) }}</p>
    </div>
    <div class="bg-white p-6 rounded-sm border border-stone-200 shadow-elevation-1">
      <p class="text-sm text-green-600">已收款项</p>
      <p class="mt-2 font-serif text-2xl font-bold text-green-700">{{ formatAmount(overview?.total_received || 0) }}</p>
    </div>
    <div class="bg-white p-6 rounded-sm border border-stone-200 shadow-elevation-1">
      <p class="text-sm text-red-500">逾期款项</p>
      <p class="mt-2 font-serif text-2xl font-bold text-red-600">
        {{ formatAmount(overview?.total_overdue || 0) }}
        <span class="text-sm font-normal text-red-400 ml-1">{{ overview?.overdue_count || 0 }}笔</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentOverview } from '~/types/models'

defineProps({
  overview: { type: Object as () => PaymentOverview | null, default: null },
})

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}
</script>
