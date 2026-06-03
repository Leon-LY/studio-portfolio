<template>
  <div>
    <AdminHeader title="Categories" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-xl border border-gray-200">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Manage Categories</h3>
          <BaseButton size="sm" @click="showAdd = true">Add Category</BaseButton>
        </div>

        <!-- Add form -->
        <div v-if="showAdd" class="p-5 border-b border-gray-100 bg-gray-50">
          <div class="flex gap-3">
            <BaseInput v-model="newName" label="Name" placeholder="Category name" wrapper-class="flex-1" />
            <BaseInput v-model="newSlug" label="Slug" placeholder="category-slug" wrapper-class="flex-1" />
          </div>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">Save</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false">Cancel</BaseButton>
          </div>
        </div>

        <!-- List -->
        <div v-if="categories.length > 0" class="divide-y divide-gray-100">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ cat.name }}</p>
              <p class="text-xs text-gray-500">{{ cat.slug }}</p>
            </div>
            <button
              class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              @click="handleDelete(cat.id, cat.name)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <EmptyState
          v-else
          icon="lucide:folder-tree"
          title="No categories"
          description="Add categories like Residential, Commercial, etc."
          wrapper-class="py-8"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminCategories } from '#imports'
import type { Category } from '~/types/models'

const { fetchAll, create, remove } = useAdminCategories()

const categories = ref<Category[]>([])
const showAdd = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)

onMounted(async () => {
  categories.value = await fetchAll()
})

async function handleAdd() {
  if (!newName.value || !newSlug.value) return
  saving.value = true
  try {
    await create(newName.value, newSlug.value)
    categories.value = await fetchAll()
    newName.value = ''
    newSlug.value = ''
    showAdd.value = false
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Delete category "${name}"?`)) return
  try {
    await remove(id)
    categories.value = await fetchAll()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
