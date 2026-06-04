<template>
  <NuxtLink
    :to="`/projects/${project.slug}`"
    :class="cardClasses"
  >
    <!-- 封面图 -->
    <div :class="imageClasses">
      <div
        v-if="project.cover_image_url"
        class="w-full h-full bg-warm-100"
      >
        <img
          :src="project.cover_image_url"
          :alt="project.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="w-full h-full bg-warm-100 flex items-center justify-center"
      >
        <Icon name="lucide:image" size="32" class="text-warm-300" />
      </div>

      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-warm-900/0 group-hover:bg-warm-900/5 transition-colors duration-500" />
    </div>

    <!-- 信息 -->
    <div :class="infoClasses">
      <div class="flex items-center gap-2 mb-2">
        <span
          v-if="project.category"
          class="text-xs text-accent-500 font-medium uppercase tracking-wider"
        >
          {{ project.category.name }}
        </span>
      </div>
      <h3 :class="titleClasses">{{ project.title }}</h3>
      <p
        v-if="project.description && variant !== 'compact'"
        class="mt-2 text-sm text-warm-500 line-clamp-2 leading-relaxed"
      >
        {{ project.description }}
      </p>

      <!-- 风格标签 -->
      <div v-if="project.styles && project.styles.length > 0 && variant !== 'compact'" class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="style in project.styles"
          :key="style.id"
          class="px-2.5 py-0.5 text-xs bg-warm-100 text-warm-500 rounded-full"
        >
          {{ style.name }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types/models'

const props = defineProps({
  project: {
    type: Object as PropType<Project>,
    required: true,
  },
  variant: {
    type: String as PropType<'featured' | 'grid' | 'compact'>,
    default: 'grid',
  },
})

const cardClasses = computed(() => {
  const base = 'group block bg-cream rounded-sm overflow-hidden border border-warm-100 hover:-translate-y-1 hover:shadow-elevation-4 transition-all duration-500'
  return base
})

const imageClasses = computed(() => {
  const variants: Record<string, string> = {
    featured: 'relative aspect-[4/3] overflow-hidden',
    grid: 'relative aspect-[4/3] overflow-hidden',
    compact: 'relative aspect-[16/9] overflow-hidden',
  }
  return variants[props.variant] || variants.grid
})

const infoClasses = computed(() => {
  const variants: Record<string, string> = {
    compact: 'p-4',
    featured: 'p-6',
    grid: 'p-5',
  }
  return variants[props.variant] || variants.grid
})

const titleClasses = computed(() => {
  const base = 'font-semibold text-warm-800 group-hover:text-warm-700 transition-colors line-clamp-1'
  if (props.variant === 'compact') return `${base} text-base`
  // 列表模式使用衬线字体
  return `font-serif text-lg ${base}`
})
</script>
