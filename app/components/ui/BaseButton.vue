<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>,
    default: 'primary',
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md',
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants: Record<string, string> = {
    primary: 'bg-warm-800 text-cream hover:bg-warm-700 hover:scale-[1.02] focus:ring-warm-500 shadow-elevation-1',
    secondary: 'bg-warm-100 text-warm-700 hover:bg-warm-200 focus:ring-warm-500',
    outline: 'border border-warm-300 text-warm-700 hover:bg-warm-50 hover:border-warm-400 focus:ring-warm-500',
    ghost: 'text-warm-600 hover:bg-warm-100 hover:text-warm-800 focus:ring-warm-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] focus:ring-red-500',
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return [
    base,
    variants[props.variant] || variants.primary,
    sizes[props.size] || sizes.md,
    props.fullWidth ? 'w-full' : '',
  ].join(' ')
})
</script>
