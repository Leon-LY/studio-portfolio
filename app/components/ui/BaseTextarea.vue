<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="textareaId" class="block text-sm font-medium text-stone-700">
      {{ label }}
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="block w-full rounded-sm border border-stone-300 px-3 py-2 text-sm shadow-sm placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 disabled:bg-stone-50 transition-colors resize-y bg-white"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="hint" class="text-sm text-stone-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const textareaId = `textarea-${Math.random().toString(36).slice(2, 9)}`
</script>
