<template>
  <span :class="badgeClasses">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { ProjectStatus } from '~/types/models'

const props = defineProps({
  status: {
    type: String as PropType<ProjectStatus>,
    required: true,
  },
})

const labels: Record<ProjectStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

const colors: Record<ProjectStatus, string> = {
  draft: 'bg-warm-100 text-warm-600',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
}

const label = computed(() => labels[props.status] || props.status)
const badgeClasses = computed(() => `inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${colors[props.status] || colors.draft}`)
</script>
