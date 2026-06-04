<template>
  <div>
    <div v-if="!milestones || milestones.length === 0" class="py-8">
      <EmptyState
        icon="lucide:receipt"
        title="暂无回款节点"
        description="添加项目的回款节点以追踪收款进度。"
      />
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="m in milestones"
        :key="m.id"
        class="flex items-center justify-between p-4 bg-stone-50 rounded-sm border border-stone-200 hover:border-stone-300 transition-colors"
      >
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <!-- Status dot -->
          <span
            class="flex-shrink-0 w-2.5 h-2.5 rounded-full"
            :class="{
              'bg-amber-400': m.status === 'pending',
              'bg-green-500': m.status === 'paid',
              'bg-red-500': m.status === 'overdue',
            }"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <p class="text-sm font-medium text-stone-800">{{ m.title }}</p>
              <span
                class="inline-flex px-2 py-0.5 text-xs rounded-full"
                :class="statusColor(m.status)"
              >
                {{ statusLabel(m.status) }}
              </span>
            </div>
            <p class="text-xs text-stone-400 mt-1">
              到期：{{ formatDate(m.due_date) }}
              <template v-if="m.paid_date">
                · 实际收款：{{ formatDate(m.paid_date) }}
              </template>
              <template v-if="m.notes">
                · {{ m.notes }}
              </template>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 ml-4">
          <p class="text-sm font-semibold text-stone-700 whitespace-nowrap">{{ formatAmount(m.amount) }}</p>
          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button
              v-if="m.status !== 'paid'"
              class="p-1.5 text-green-500 hover:bg-green-50 rounded transition-colors"
              title="标记为已收款"
              @click="$emit('mark-paid', m)"
            >
              <Icon name="lucide:check-circle" size="16" />
            </button>
            <button
              class="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"
              title="编辑"
              @click="$emit('edit', m)"
            >
              <Icon name="lucide:pencil" size="16" />
            </button>
            <button
              class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除"
              @click="$emit('delete', m)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMilestone } from '~/types/models'

defineProps({
  milestones: { type: Array as () => PaymentMilestone[], required: true },
})

defineEmits(['edit', 'delete', 'mark-paid'])

function statusColor(status: string): string {
  return {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  }[status] || 'bg-stone-100 text-stone-500'
}

function statusLabel(status: string): string {
  return { pending: '待收款', paid: '已收款', overdue: '已逾期' }[status] || status
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
