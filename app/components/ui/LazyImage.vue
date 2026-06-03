<template>
  <img
    :src="loadedSrc"
    :alt="alt"
    :class="[
      'transition-opacity duration-500',
      loaded ? 'opacity-100' : 'opacity-0',
      className,
    ]"
    :style="{ aspectRatio: aspectRatio || undefined, objectFit }"
    loading="lazy"
    @load="onLoad"
    @error="onError"
  />
</template>

<script setup lang="ts">
// LazyImage handles lazy loading + blur-up placeholder for portfolio images
// Uses native loading="lazy" and opacity transition on load
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  aspectRatio: { type: String, default: '' }, // e.g., '16/9', '4/3'
  objectFit: { type: String, default: 'cover' },
  className: { type: String, default: '' },
})

const emit = defineEmits(['loaded', 'error'])

const loaded = ref(false)
const loadedSrc = ref('')
const hasError = ref(false)

// Set up src once on mount for SSR compatibility
onMounted(() => {
  loadedSrc.value = props.src
})

function onLoad() {
  loaded.value = true
  emit('loaded')
}

function onError() {
  hasError.value = true
  loaded.value = true
  emit('error')
}

const props = defineProps()
</script>
