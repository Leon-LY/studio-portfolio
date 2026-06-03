<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    content-class="w-full max-w-sm"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="text-sm text-gray-600">{{ message }}</p>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="outline" @click="$emit('update:modelValue', false)">
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          :variant="confirmVariant"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  confirmVariant: {
    type: String as PropType<'primary' | 'danger'>,
    default: 'primary',
  },
  loading: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'confirm'])
</script>
