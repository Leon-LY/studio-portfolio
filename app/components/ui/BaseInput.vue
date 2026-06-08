<template>
  <div :class="wrapperClass">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-stone-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="isPassword && showPassword ? 'text' : type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[inputClasses, isPassword ? 'pr-10' : '']"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        @click="showPassword = !showPassword"
      >
        <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" size="16" />
      </button>
      <slot name="suffix" />
    </div>
    <p v-if="hint && !error" class="mt-1 text-sm text-stone-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  wrapperClass: { type: String, default: '' },
})

defineEmits(['update:modelValue', 'blur'])

const inputId = useId()
const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')

const inputClasses = 'block w-full rounded-sm border border-stone-300 px-3 py-2 text-sm shadow-sm placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 disabled:bg-stone-50 disabled:text-stone-500 transition-colors bg-white'
</script>
