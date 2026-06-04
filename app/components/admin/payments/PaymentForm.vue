<template>
  <BaseModal v-model="visible" :title="isEditing ? '编辑回款节点' : '新增回款节点'" @update:model-value="$emit('update:modelValue', $event)">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput v-model="form.title" label="节点名称" placeholder="例如：方案设计阶段回款" required />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.due_date" label="到期日期" type="date" required />
        <BaseInput v-model="amountStr" label="金额 (元)" type="number" placeholder="0.00" required />
      </div>
      <BaseTextarea v-model="form.notes" label="备注" placeholder="可选备注信息" rows="2" />

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="outline" type="button" @click="visible = false">取消</BaseButton>
        <BaseButton type="submit" :loading="saving">{{ isEditing ? '保存' : '创建' }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import type { PaymentMilestone } from '~/types/models'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  milestone: { type: Object as () => PaymentMilestone | null, default: null },
  projectId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEditing = computed(() => !!props.milestone)
const saving = ref(false)

const form = reactive({
  title: '',
  amount: 0,
  due_date: '',
  notes: '',
})

const amountStr = computed({
  get: () => form.amount ? String(form.amount) : '',
  set: (v) => { form.amount = parseFloat(v) || 0 },
})

// Populate form when editing, reset when creating new
watch(() => props.milestone, (m) => {
  if (m) {
    form.title = m.title
    form.amount = m.amount
    form.due_date = m.due_date || ''
    form.notes = m.notes || ''
  } else {
    form.title = ''
    form.amount = 0
    form.due_date = ''
    form.notes = ''
  }
}, { immediate: true })

// Also clear form when modal opens for a new milestone (milestone was already null)
watch(() => props.modelValue, (open) => {
  if (open && !props.milestone) {
    form.title = ''
    form.amount = 0
    form.due_date = ''
    form.notes = ''
  }
})

async function handleSubmit() {
  saving.value = true
  try {
    emit('saved', {
      ...form,
      project_id: props.milestone?.project_id || props.projectId,
    })
    // Don't close modal here — let parent close it after async work completes
  } finally {
    saving.value = false
  }
}
</script>
