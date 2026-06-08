<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-stone-200">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="['px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider', col.headerClass]"
          >
            <button
              v-if="col.sortable"
              class="flex items-center gap-1 hover:text-stone-600 transition-colors"
              @click="$emit('sort', col.key)"
            >
              {{ col.label }}
              <Icon
                v-if="sortKey === col.key"
                :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                size="14"
              />
            </button>
            <span v-else>{{ col.label }}</span>
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
            操作
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone-50">
        <tr v-if="loading">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-12 text-center">
            <LoadingSpinner size="md" text="加载中..." />
          </td>
        </tr>
        <tr v-else-if="empty">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-12 text-center">
            <EmptyState :icon="emptyIcon" :title="emptyTitle" :description="emptyDesc" />
          </td>
        </tr>
        <slot v-else name="rows" />
      </tbody>
    </table>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center gap-1">
      <button
        class="px-3 py-1.5 text-sm rounded-sm border border-stone-200 text-stone-500 hover:border-stone-300 disabled:opacity-30 transition-colors"
        :disabled="currentPage <= 1"
        @click="$emit('page', currentPage - 1)"
      >
        <Icon name="lucide:chevron-left" size="14" />
      </button>
      <template v-for="page in pageNumbers" :key="page">
        <span v-if="page === -1" class="px-2 py-1.5 text-stone-400">...</span>
        <button
          v-else
          class="px-3 py-1.5 text-sm rounded-sm border transition-colors"
          :class="page === currentPage ? 'bg-stone-800 text-canvas border-stone-800' : 'border-stone-200 text-stone-500 hover:border-stone-300'"
          @click="$emit('page', page)"
        >
          {{ page }}
        </button>
      </template>
      <button
        class="px-3 py-1.5 text-sm rounded-sm border border-stone-200 text-stone-500 hover:border-stone-300 disabled:opacity-30 transition-colors"
        :disabled="currentPage >= totalPages"
        @click="$emit('page', currentPage + 1)"
      >
        <Icon name="lucide:chevron-right" size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  headerClass?: string
}

const props = defineProps({
  columns: { type: Array as PropType<DataTableColumn[]>, required: true },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  emptyIcon: { type: String, default: 'lucide:inbox' },
  emptyTitle: { type: String, default: '暂无数据' },
  emptyDesc: { type: String, default: '' },
  totalPages: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  sortKey: { type: String, default: '' },
  sortDir: { type: String as PropType<'asc' | 'desc'>, default: 'desc' },
})

defineEmits(['sort', 'page'])

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= props.totalPages; i++) pages.push(i)
  if (pages.length <= 7) return pages
  const c = props.currentPage
  if (c <= 4) return [...pages.slice(0, 5), -1, pages[pages.length - 1]]
  if (c >= pages.length - 3) return [pages[0], -1, ...pages.slice(-5)]
  return [pages[0], -1, c - 1, c, c + 1, -1, pages[pages.length - 1]]
})
</script>
