<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="modelValue" class="fixed inset-0 z-[100] bg-stone-900/95 flex items-center justify-center" @click.self="close">
        <!-- Close button -->
        <button class="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10" @click="close" aria-label="关闭">
          <Icon name="lucide:x" size="28" />
        </button>
        <!-- Counter -->
        <div class="absolute top-4 left-4 text-white/50 text-sm z-10">{{ currentIndex + 1 }} / {{ images.length }}</div>
        <!-- Prev -->
        <button v-if="images.length > 1" class="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-10" @click.stop="prev" aria-label="上一张">
          <Icon name="lucide:chevron-left" size="32" />
        </button>
        <!-- Image -->
        <img :src="currentSrc" :alt="currentAlt" class="max-h-[90vh] max-w-[90vw] object-contain select-none" @load="loaded = true" :class="{ 'opacity-0': !loaded }" />
        <!-- Next -->
        <button v-if="images.length > 1" class="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-10" @click.stop="next" aria-label="下一张">
          <Icon name="lucide:chevron-right" size="32" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface ImageItem { src: string; alt?: string }

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  images: { type: Array as () => ImageItem[], required: true },
  initialIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

const currentIndex = ref(props.initialIndex)
const loaded = ref(false)

const currentSrc = computed(() => props.images[currentIndex.value]?.src || '')
const currentAlt = computed(() => props.images[currentIndex.value]?.alt || '')

watch(() => props.initialIndex, (v) => { currentIndex.value = v; loaded.value = false })
watch(() => props.modelValue, (v) => { if (v) { currentIndex.value = props.initialIndex; loaded.value = false; document.addEventListener('keydown', onKey) } else { document.removeEventListener('keydown', onKey) } })

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

function prev() { if (currentIndex.value > 0) { currentIndex.value--; loaded.value = false } }
function next() { if (currentIndex.value < props.images.length - 1) { currentIndex.value++; loaded.value = false } }
function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.lightbox-enter-active { transition: opacity 0.3s ease; }
.lightbox-leave-active { transition: opacity 0.2s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
