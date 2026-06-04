<template>
  <div :class="wrapperClass" :style="{ aspectRatio: aspectRatio || undefined }">
    <!-- 占位 -->
    <div
      v-if="!loaded"
      class="absolute inset-0 bg-stone-100 animate-pulse"
    />
    <!-- 图片 -->
    <img
      :src="loadedSrc"
      :alt="alt"
      :class="[
        'transition-all duration-700 ease-out',
        loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
        className,
      ]"
      :style="{ objectFit }"
      loading="lazy"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  aspectRatio: { type: String, default: '' },
  objectFit: { type: String, default: 'cover' },
  className: { type: String, default: '' },
})

const emit = defineEmits(['loaded', 'error'])

const loaded = ref(false)
const loadedSrc = ref('')
const wrapperClass = computed(() =>
  `relative overflow-hidden ${props.aspectRatio ? '' : ''}`,
)

onMounted(() => {
  loadedSrc.value = props.src
})

function onLoad() {
  loaded.value = true
  emit('loaded')
}

function onError() {
  loaded.value = true
  emit('error')
}
</script>
