<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 背景 -->
        <div class="absolute inset-0 bg-warm-900/50 backdrop-blur-sm" @click="closeOnBackdrop && $emit('update:modelValue', false)" />

        <!-- 内容 -->
        <div :class="['relative bg-white rounded-sm shadow-elevation-4 max-h-[90vh] overflow-auto', contentClass]" v-bind="$attrs">
          <!-- 头部 -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-warm-100">
            <h3 class="text-lg font-semibold text-warm-800">{{ title }}</h3>
            <button
              v-if="closable"
              class="p-1 text-warm-400 hover:text-warm-600 rounded-sm hover:bg-warm-100 transition-colors"
              @click="$emit('update:modelValue', false)"
            >
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
          <slot name="header" />

          <!-- 正文 -->
          <div :class="bodyClass">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-warm-100 bg-warm-50 rounded-b-sm">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  contentClass: { type: String, default: 'w-full max-w-lg' },
  bodyClass: { type: String, default: 'px-6 py-4' },
  closable: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
