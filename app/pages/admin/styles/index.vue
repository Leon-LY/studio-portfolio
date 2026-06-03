<template>
  <div>
    <AdminHeader title="Styles" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-xl border border-gray-200">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Manage Styles</h3>
          <BaseButton size="sm" @click="showAdd = true">Add Style</BaseButton>
        </div>

        <!-- Add form -->
        <div v-if="showAdd" class="p-5 border-b border-gray-100 bg-gray-50">
          <div class="flex gap-3">
            <BaseInput v-model="newName" label="Name" placeholder="Style name" wrapper-class="flex-1" />
            <BaseInput v-model="newSlug" label="Slug" placeholder="style-slug" wrapper-class="flex-1" />
          </div>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">Save</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false">Cancel</BaseButton>
          </div>
        </div>

        <!-- List -->
        <div v-if="styles.length > 0" class="divide-y divide-gray-100">
          <div
            v-for="style in styles"
            :key="style.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ style.name }}</p>
              <p class="text-xs text-gray-500">{{ style.slug }}</p>
            </div>
            <button
              class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              @click="handleDelete(style.id, style.name)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <EmptyState
          v-else
          icon="lucide:palette"
          title="No styles"
          description="Add styles like Modern, Minimalist, Classical, etc."
          wrapper-class="py-8"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Style } from '~/types/models'

const { fetchAll, create, remove } = useAdminStyles()

const styles = ref<Style[]>([])
const showAdd = ref(false)
const newName = ref('')
const newSlug = ref('')
const saving = ref(false)

onMounted(async () => {
  styles.value = await fetchAll()
})

async function handleAdd() {
  if (!newName.value || !newSlug.value) return
  saving.value = true
  try {
    await create(newName.value, newSlug.value)
    styles.value = await fetchAll()
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
  if (!confirm(`Delete style "${name}"?`)) return
  try {
    await remove(id)
    styles.value = await fetchAll()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
