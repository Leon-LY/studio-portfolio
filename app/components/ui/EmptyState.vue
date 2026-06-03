<template>
  <div :class="wrapperClass">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon :name="icon" size="28" class="text-gray-400" />
      </div>
      <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
      <div v-if="$slots.action" class="mt-4">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icon: { type: String, default: 'lucide:inbox' },
  title: { type: String, default: 'Nothing here' },
  description: { type: String, default: '' },
  wrapperClass: { type: String, default: 'py-12' },
})
</script>
