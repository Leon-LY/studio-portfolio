<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <!-- Title -->
    <BaseInput
      v-model="form.title"
      label="Title"
      placeholder="Project title"
      required
      @blur="autoGenerateSlug"
    />

    <!-- Slug -->
    <BaseInput
      v-model="form.slug"
      label="Slug"
      placeholder="project-slug"
      hint="URL-friendly name, auto-generated from title"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Category -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-gray-700">Category</label>
        <select
          v-model="form.category_id"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option :value="null">None</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <select
          v-model="form.status"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <!-- Styles (multi-select) -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-gray-700">Styles</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          :class="[
            'px-3 py-1.5 text-sm rounded-full border transition-colors',
            form.style_ids.includes(style.id)
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
          ]"
          @click="toggleStyle(style.id)"
        >
          {{ style.name }}
        </button>
      </div>
    </div>

    <!-- Description -->
    <BaseTextarea
      v-model="form.description"
      label="Description"
      placeholder="Short project description (shown on cards)"
      rows="2"
    />

    <!-- Content (placeholder for Tiptap editor) -->
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-gray-700">Content</label>
      <BaseTextarea
        v-model="form.content"
        placeholder="Detailed project description (HTML supported)"
        rows="10"
        hint="Rich text editor will be available in the next phase"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BaseInput v-model="form.location" label="Location" placeholder="City, Country" />
      <BaseInput v-model="form.client" label="Client" placeholder="Client name" />
      <BaseInput v-model="form.area_sqm" label="Area (m²)" placeholder="500" type="number" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput v-model="form.completion_date" label="Completion Date" type="date" />
    </div>

    <!-- Featured -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input v-model="form.is_featured" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
      <span class="text-sm text-gray-700">Featured project (shown on homepage)</span>
    </label>

    <!-- SEO fields -->
    <details class="group">
      <summary class="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700">
        SEO Settings
      </summary>
      <div class="mt-3 space-y-3 pl-2">
        <BaseInput v-model="form.seo_title" label="SEO Title" placeholder="Custom page title" />
        <BaseTextarea v-model="form.seo_description" label="SEO Description" placeholder="Custom meta description" rows="2" />
      </div>
    </details>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
      <BaseButton type="submit" :loading="saving">
        {{ projectId ? 'Save Changes' : 'Create Project' }}
      </BaseButton>
      <BaseButton type="button" variant="outline" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <p v-if="saveMessage" class="text-sm text-green-600">{{ saveMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ProjectFormData } from '~/types/models'

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

// Load filter options
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
    saveMessage.value = 'Saved!'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } finally {
    saving.value = false
  }
}
</script>
