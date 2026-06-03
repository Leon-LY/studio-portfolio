<template>
  <NuxtLink
    :to="`/projects/${project.slug}`"
    :class="cardClasses"
  >
    <!-- Cover image -->
    <div :class="imageClasses">
      <div
        v-if="project.cover_image_url"
        class="w-full h-full bg-gray-100"
      >
        <img
          :src="project.cover_image_url"
          :alt="project.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="w-full h-full bg-gray-100 flex items-center justify-center"
      >
        <Icon name="lucide:image" size="32" class="text-gray-300" />
      </div>

      <!-- Overlay on hover -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>

    <!-- Info -->
    <div class="p-4">
      <div class="flex items-center gap-2 mb-2">
        <span
          v-if="project.category"
          class="text-xs text-gray-500 font-medium uppercase tracking-wider"
        >
          {{ project.category.name }}
        </span>
      </div>
      <h3 :class="titleClasses">{{ project.title }}</h3>
      <p
        v-if="project.description && variant !== 'compact'"
        class="mt-1 text-sm text-gray-500 line-clamp-2"
      >
        {{ project.description }}
      </p>

      <!-- Style tags -->
      <div v-if="project.styles && project.styles.length > 0 && variant !== 'compact'" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="style in project.styles"
          :key="style.id"
          class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
        >
          {{ style.name }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types/models'

defineProps({
  project: {
    type: Object as PropType<Project>,
    required: true,
  },
  variant: {
    type: String as PropType<'featured' | 'grid' | 'compact'>,
    default: 'grid',
  },
})

const props = defineProps()

const cardClasses = computed(() => {
  const base = 'group block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg'
  const variants: Record<string, string> = {
    featured: 'border border-gray-100 hover:border-gray-200',
    grid: 'border border-gray-100 hover:border-gray-200',
    compact: 'border border-gray-100 hover:border-gray-200',
  }
  return `${base} ${variants[props.variant] || variants.grid}`
})

const imageClasses = computed(() => {
  const variants: Record<string, string> = {
    featured: 'relative aspect-[4/3] overflow-hidden',
    grid: 'relative aspect-[4/3] overflow-hidden',
    compact: 'relative aspect-[16/9] overflow-hidden',
  }
  return variants[props.variant] || variants.grid
})

const titleClasses = computed(() => {
  const variants: Record<string, string> = {
    compact: 'text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1',
    featured: 'text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1',
    grid: 'text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1',
  }
  return variants[props.variant] || variants.grid
})
</script>
