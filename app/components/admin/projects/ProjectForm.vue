<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <!-- 标题 -->
    <BaseInput
      v-model="form.title"
      label="项目标题"
      placeholder="输入项目标题"
      required
      @blur="autoGenerateSlug"
    />

    <!-- 标识符 -->
    <BaseInput
      v-model="form.slug"
      label="URL 标识符"
      placeholder="project-slug"
      hint="由标题自动生成，用于网址"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 分类 -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-stone-700">分类</label>
        <select
          v-model="form.category_id"
          class="block w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600"
        >
          <option :value="null">无</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- 状态 -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-stone-700">状态</label>
        <select
          v-model="form.status"
          class="block w-full rounded-sm border border-stone-300 px-3 py-2 text-sm bg-white focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600"
        >
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>
    </div>

    <!-- 风格（多选） -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-stone-700">建筑风格</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          :class="[
            'px-3 py-1.5 text-sm rounded-full border transition-colors',
            form.style_ids.includes(style.id)
              ? 'bg-stone-800 text-canvas border-stone-800'
              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400',
          ]"
          @click="toggleStyle(style.id)"
        >
          {{ style.name }}
        </button>
      </div>
    </div>

    <!-- 简介 -->
    <BaseTextarea
      v-model="form.description"
      label="项目简介"
      placeholder="简短的项目描述（展示在卡片上）"
      rows="2"
    />

    <!-- 正文 -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-stone-700">正文内容</label>
      <BaseTextarea
        v-model="form.content"
        placeholder="详细的项目描述（支持 HTML）"
        rows="10"
        hint="富文本编辑器将在后续版本中集成"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BaseInput v-model="form.location" label="位置" placeholder="城市，国家" />
      <BaseInput v-model="form.client" label="客户" placeholder="客户名称" />
      <BaseInput v-model="form.area_sqm" label="面积（m²）" placeholder="500" type="number" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput v-model="form.completion_date" label="完成日期" type="date" />
    </div>

    <!-- 精选 -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input v-model="form.is_featured" type="checkbox" class="w-4 h-4 rounded-sm border-stone-300 text-stone-800 focus:ring-stone-600" />
      <span class="text-sm text-stone-700">精选项目（在首页展示）</span>
    </label>

    <!-- SEO 设置 -->
    <details class="group">
      <summary class="text-sm font-medium text-stone-500 cursor-pointer hover:text-stone-700">
        SEO 设置
        <span class="text-xs text-stone-400 ml-2">— 控制搜索引擎中如何展示此项目</span>
      </summary>
      <div class="mt-3 space-y-3 pl-2 border-l-2 border-stone-200">
        <p class="text-xs text-stone-400">以下内容仅影响搜索引擎结果页面（如 Google、百度），不影响页面实际显示。留空则使用默认值。</p>
        <BaseInput v-model="form.seo_title" label="SEO 标题" placeholder="自定义页面标题（出现在搜索结果中）" hint="如不填写，默认使用项目标题" />
        <BaseTextarea v-model="form.seo_description" label="SEO 描述" placeholder="自定义页面描述（出现在搜索结果摘要中）" :rows="2" hint="如不填写，默认使用项目简介" />
      </div>
    </details>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-3 pt-4 border-t border-stone-200">
      <BaseButton type="submit" :loading="saving">
        {{ projectId ? '保存更改' : '创建项目' }}
      </BaseButton>
      <BaseButton type="button" variant="outline" @click="$emit('cancel')">
        取消
      </BaseButton>
      <p v-if="saveMessage" class="text-sm text-green-600">{{ saveMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ProjectFormData } from '~/types/models'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

const props = defineProps({
  initialData: { type: Object as PropType<Partial<ProjectFormData>>, default: () => ({}) },
  projectId: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])

const { fetchCategories } = useCategories()
const { fetchStyles } = useStyles()
const { generateSlug } = useAdminProjects()

const saving = ref(false)
const saveMessage = ref('')

const form = reactive<ProjectFormData>({
  title: '',
  slug: '',
  description: '',
  content: '',
  category_id: null,
  status: 'draft',
  completion_date: null,
  location: '',
  client: '',
  area_sqm: null,
  is_featured: false,
  style_ids: [],
  seo_title: '',
  seo_description: '',
  ...props.initialData,
})

const { data: categories } = useAsyncData('admin-categories', () => fetchCategories())
const { data: styles } = useAsyncData('admin-styles', () => fetchStyles())

function autoGenerateSlug() {
  if (!form.slug || form.slug === generateSlug(form.title)) {
    form.slug = generateSlug(form.title)
  }
}

function toggleStyle(id: string) {
  const idx = form.style_ids.indexOf(id)
  if (idx >= 0) {
    form.style_ids.splice(idx, 1)
  } else {
    form.style_ids.push(id)
  }
}

async function onSubmit() {
  saving.value = true
  saveMessage.value = ''
  try {
    emit('submit', { ...form })
    saveMessage.value = '已保存！'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } finally {
    saving.value = false
  }
}
</script>
