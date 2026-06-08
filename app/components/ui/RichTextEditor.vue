<template>
  <div class="rich-editor rounded-sm border border-stone-300 bg-white focus-within:border-stone-600 focus-within:ring-1 focus-within:ring-stone-600 transition-colors">
    <div v-if="editor" class="flex items-center gap-0.5 px-3 py-2 border-b border-stone-100 flex-wrap">
      <button v-for="btn in toolbarButtons" :key="btn.action" type="button" :class="['p-1.5 rounded-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors', editor.isActive(btn.active || btn.action) ? 'bg-stone-100 text-stone-800' : '']" :title="btn.title" @click="btn.handler ? btn.handler() : editor.chain().focus()[btn.action]().run()">
        <Icon :name="btn.icon" size="16" />
      </button>
    </div>
    <editor-content :editor="editor" class="prose prose-sm max-w-none px-3 py-2 min-h-[200px] focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Image.configure({ inline: true }),
  ],
  editorProps: {
    attributes: { class: 'outline-none' },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '')
  }
})

onUnmounted(() => { editor.value?.destroy() })

const toolbarButtons = [
  { action: 'toggleBold', icon: 'lucide:bold', title: '加粗' },
  { action: 'toggleItalic', icon: 'lucide:italic', title: '斜体' },
  { action: 'toggleStrike', icon: 'lucide:strikethrough', title: '删除线' },
  { action: 'toggleHeading', active: 'heading', icon: 'lucide:heading', title: '标题', handler: null } as any,
  { action: 'toggleBulletList', icon: 'lucide:list', title: '无序列表' },
  { action: 'toggleOrderedList', icon: 'lucide:list-ordered', title: '有序列表' },
  { action: 'toggleBlockquote', icon: 'lucide:quote', title: '引用' },
  { action: 'setHorizontalRule', icon: 'lucide:minus', title: '分割线' },
]

// Heading toggle needs special handling
const headingBtn = toolbarButtons.find(b => b.action === 'toggleHeading')!
headingBtn.handler = () => {
  editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
}
</script>
