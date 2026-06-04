// Payment milestones — CRUD + calendar + overview
import type { PaymentMilestone, PaymentOverview } from '~/types/models'

export function usePayments(projectId?: string) {
  const milestones = ref<PaymentMilestone[]>([])
  const overview = ref<PaymentOverview | null>(null)
  const calendarData = ref<PaymentMilestone[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMilestones(pid?: string) {
    const targetId = pid || projectId
    if (!targetId) return
    isLoading.value = true
    error.value = null
    try {
      milestones.value = await adminApi.getMilestones(targetId)
    } catch (e: any) {
      error.value = e.message || '获取回款节点失败'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOverview() {
    error.value = null
    try {
      overview.value = await adminApi.getPaymentOverview()
    } catch (e: any) {
      error.value = e.message || '获取回款概览失败'
    }
  }

  async function fetchCalendar(month: string) {
    error.value = null
    try {
      calendarData.value = await adminApi.getPaymentCalendar(month)
    } catch (e: any) {
      error.value = e.message || '获取回款日历失败'
    }
  }

  async function createMilestone(data: Partial<PaymentMilestone>) {
    error.value = null
    try {
      const created = await adminApi.createMilestone(data)
      milestones.value = [...milestones.value, created]
      return created
    } catch (e: any) {
      error.value = e.message || '创建回款节点失败'
      throw e
    }
  }

  async function updateMilestone(id: string, data: Partial<PaymentMilestone>) {
    error.value = null
    try {
      const updated = await adminApi.updateMilestone(id, data)
      const idx = milestones.value.findIndex(m => m.id === id)
      if (idx !== -1) milestones.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e.message || '更新回款节点失败'
      throw e
    }
  }

  async function updateStatus(id: string, status: string) {
    error.value = null
    try {
      const updated = await adminApi.updateMilestoneStatus(id, status)
      const idx = milestones.value.findIndex(m => m.id === id)
      if (idx !== -1) milestones.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e.message || '更新回款状态失败'
      throw e
    }
  }

  async function removeMilestone(id: string) {
    error.value = null
    try {
      await adminApi.deleteMilestone(id)
      milestones.value = milestones.value.filter(m => m.id !== id)
    } catch (e: any) {
      error.value = e.message || '删除回款节点失败'
    }
  }

  // Helper: total amount for current milestones
  const totalAmount = computed(() =>
    milestones.value.reduce((sum, m) => sum + Number(m.amount), 0),
  )

  // Helper: paid amount
  const paidAmount = computed(() =>
    milestones.value.filter(m => m.status === 'paid').reduce((sum, m) => sum + Number(m.amount), 0),
  )

  // Helper: overdue count
  const overdueCount = computed(() =>
    milestones.value.filter(m => m.status === 'overdue').length,
  )

  // Helper: milestone status colors
  function statusColor(status: string): string {
    return {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    }[status] || 'bg-warm-100 text-warm-500'
  }

  function statusLabel(status: string): string {
    return {
      pending: '待收款',
      paid: '已收款',
      overdue: '已逾期',
    }[status] || status
  }

  // Format currency
  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
  }

  return {
    milestones, overview, calendarData, isLoading, error,
    totalAmount, paidAmount, overdueCount,
    fetchMilestones, fetchOverview, fetchCalendar,
    createMilestone, updateMilestone, updateStatus, removeMilestone,
    statusColor, statusLabel, formatAmount,
  }
}
