/**
 * Toast 通知 Composable
 * 全局共享状态，任意组件可调用 addToast() / removeToast()
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

const toasts = ref<Toast[]>([])
let counter = 0

export function useToast() {
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

  function success(message: string, duration?: number) { addToast(message, 'success', duration) }
  function error(message: string, duration?: number) { addToast(message, 'error', duration) }
  function info(message: string, duration?: number) { addToast(message, 'info', duration) }
  function warning(message: string, duration?: number) { addToast(message, 'warning', duration) }

  return { toasts: readonly(toasts), addToast, removeToast, success, error, info, warning }
}
