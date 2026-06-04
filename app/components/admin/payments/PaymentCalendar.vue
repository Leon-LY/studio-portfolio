<template>
  <div>
    <!-- Month selector -->
    <div class="flex items-center justify-between mb-6">
      <BaseButton variant="outline" size="sm" @click="prevMonth">
        <Icon name="lucide:chevron-left" size="16" />
      </BaseButton>
      <h3 class="text-lg font-serif font-semibold text-stone-800">{{ displayMonth }}</h3>
      <BaseButton variant="outline" size="sm" @click="nextMonth">
        <Icon name="lucide:chevron-right" size="16" />
      </BaseButton>
    </div>

    <!-- Calendar Grid -->
    <div v-if="loading" class="flex justify-center py-8">
      <LoadingSpinner size="md" text="加载中..." />
    </div>

    <div v-else class="bg-white rounded-sm border border-stone-200 overflow-hidden">
      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 text-center text-xs font-medium text-stone-400 border-b border-stone-200 bg-stone-50">
        <div v-for="day in dayLabels" :key="day" class="py-2">{{ day }}</div>
      </div>

      <!-- Calendar cells -->
      <div class="grid grid-cols-7">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="min-h-[80px] border-b border-r border-stone-100 p-1.5"
          :class="[
            cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/50',
            cell.isToday ? 'ring-1 ring-inset ring-accent-400' : '',
          ]"
        >
          <p
            class="text-xs mb-1"
            :class="cell.isCurrentMonth ? 'text-stone-600' : 'text-stone-300'"
          >
            {{ cell.day }}
          </p>
          <div class="space-y-0.5">
            <div
              v-for="m in cell.milestones"
              :key="m.id"
              class="text-xs px-1 py-0.5 rounded truncate cursor-help"
              :class="statusBg(m.status)"
              :title="`${m.title} — ¥${m.amount}`"
            >
              ¥{{ m.amount.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMilestone } from '~/types/models'
import BaseButton from '~/components/ui/BaseButton.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const { calendarData, fetchCalendar } = usePayments()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1) // 1-indexed
const loading = ref(false)

const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

const displayMonth = computed(() => `${currentYear.value}年 ${currentMonth.value}月`)

const monthKey = computed(() => `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`)

// Generate calendar cells
const calendarCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  // Build map of date -> milestones
  const milestoneMap: Record<string, PaymentMilestone[]> = {}
  for (const m of calendarData.value) {
    const d = m.due_date
    if (!milestoneMap[d]) milestoneMap[d] = []
    milestoneMap[d].push(m)
  }

  const cells: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean; milestones: PaymentMilestone[] }> = []

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    cells.push({ day: d, isCurrentMonth: false, isToday: false, milestones: [] })
  }

  // Current month
  const today = new Date()
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate()
    cells.push({
      day: d,
      isCurrentMonth: true,
      isToday,
      milestones: milestoneMap[dateStr] || [],
    })
  }

  // Next month padding
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false, isToday: false, milestones: [] })
    }
  }

  return cells
})

function statusBg(status: string): string {
  return {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  }[status] || 'bg-stone-100 text-stone-500'
}

function prevMonth() {
  if (currentMonth.value === 1) { currentYear.value--; currentMonth.value = 12 }
  else currentMonth.value--
  loadData()
}

function nextMonth() {
  if (currentMonth.value === 12) { currentYear.value++; currentMonth.value = 1 }
  else currentMonth.value++
  loadData()
}

async function loadData() {
  loading.value = true
  await fetchCalendar(monthKey.value)
  loading.value = false
}

onMounted(() => loadData())
</script>
