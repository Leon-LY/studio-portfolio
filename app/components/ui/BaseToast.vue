<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="toastClasses(toast.type)"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md"
      >
        <Icon :name="iconFor(toast.type)" size="18" />
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button class="text-current opacity-50 hover:opacity-100" @click="removeToast(toast.id)">
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

const toasts = ref<Toast[]>([])
let counter = 0

function addToast(message: string, type: ToastType = 'info', duration = 4000) {
  const id = `toast-${++counter}`
  toasts.value.push({ id, type, message })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

function toastClasses(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  }
  return map[type]
}

function iconFor(type: ToastType) {
  const map: Record<ToastType, string> = {
    success: 'lucide:circle-check',
    error: 'lucide:circle-x',
    info: 'lucide:info',
    warning: 'lucide:triangle-alert',
  }
  return map[type]
}

// Expose for global use
if (import.meta.client) {
  ;(window as any).$toast = { addToast, removeToast }
}

defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
