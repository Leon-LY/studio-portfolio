<template>
  <div :class="['flex items-center justify-center rounded-sm', sizeClass, bgClass]">
    <Icon :name="iconName" :class="sizeClass === 'w-8 h-8' ? 'text-sm' : 'text-xs'" :class="colorClass" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  extension: { type: String, required: true },
  size: { type: String as () => 'sm' | 'md' | 'lg', default: 'md' },
})

const ext = computed(() => props.extension.toLowerCase())

const iconName = computed(() => {
  const map: Record<string, string> = {
    '.pdf': 'lucide:file-text',
    '.doc': 'lucide:file-text', '.docx': 'lucide:file-text',
    '.xls': 'lucide:file-spreadsheet', '.xlsx': 'lucide:file-spreadsheet',
    '.ppt': 'lucide:presentation', '.pptx': 'lucide:presentation',
    '.dwg': 'lucide:ruler', '.dxf': 'lucide:ruler',
    '.skp': 'lucide:box',
    '.rvt': 'lucide:building', '.rfa': 'lucide:building',
    '.zip': 'lucide:archive', '.rar': 'lucide:archive', '.7z': 'lucide:archive',
    '.jpg': 'lucide:image', '.jpeg': 'lucide:image', '.png': 'lucide:image',
    '.webp': 'lucide:image', '.gif': 'lucide:image',
    '.txt': 'lucide:file-text', '.csv': 'lucide:file-spreadsheet',
  }
  return map[ext.value] || 'lucide:file'
})

const colorClass = computed(() => {
  const map: Record<string, string> = {
    '.pdf': 'text-red-500',
    '.doc': 'text-blue-500', '.docx': 'text-blue-500',
    '.xls': 'text-green-500', '.xlsx': 'text-green-500',
    '.ppt': 'text-orange-500', '.pptx': 'text-orange-500',
    '.dwg': 'text-purple-500', '.dxf': 'text-purple-500',
  }
  return map[ext.value] || 'text-warm-400'
})

const bgClass = computed(() => {
  const map: Record<string, string> = {
    '.pdf': 'bg-red-50',
    '.doc': 'bg-blue-50', '.docx': 'bg-blue-50',
    '.xls': 'bg-green-50', '.xlsx': 'bg-green-50',
    '.ppt': 'bg-orange-50', '.pptx': 'bg-orange-50',
    '.dwg': 'bg-purple-50', '.dxf': 'bg-purple-50',
  }
  return map[ext.value] || 'bg-warm-100'
})

const sizeClass = computed(() => {
  return { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10' }[props.size] || 'w-8 h-8'
})
</script>
