<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="textareaId" class="block text-sm font-medium text-stone-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :required="required"
      :class="[inputClasses, error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '']"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="hint && !error" class="text-sm text-stone-500">{{ hint }}</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const textareaId = useId()
const inputClasses = 'block w-full rounded-sm border border-stone-300 px-3 py-2 text-sm shadow-sm placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 disabled:bg-stone-50 transition-colors resize-y bg-white'
</script>
