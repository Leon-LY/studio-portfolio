<template>
  <div>
    <AdminHeader title="风格管理" />

    <div class="p-6 max-w-2xl">
      <div class="bg-white rounded-sm border border-warm-200 shadow-elevation-1">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-5 border-b border-warm-100">
          <h3 class="text-sm font-semibold text-warm-800">管理风格</h3>
          <BaseButton size="sm" @click="showAdd = true">添加风格</BaseButton>
        </div>

        <!-- 添加表单 -->
        <div v-if="showAdd" class="p-5 border-b border-warm-100 bg-warm-50">
          <div class="flex gap-3">
            <BaseInput v-model="newName" label="名称" placeholder="风格名称" wrapper-class="flex-1" />
            <BaseInput v-model="newSlug" label="标识符" placeholder="style-slug" wrapper-class="flex-1" />
          </div>
          <div class="flex gap-2 mt-3">
            <BaseButton size="sm" :loading="saving" @click="handleAdd">保存</BaseButton>
            <BaseButton size="sm" variant="outline" @click="showAdd = false">取消</BaseButton>
          </div>
        </div>

        <!-- 列表 -->
        <div v-if="styles.length > 0" class="divide-y divide-warm-100">
          <div
            v-for="style in styles"
            :key="style.id"
            class="flex items-center justify-between p-4 hover:bg-warm-50 transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-warm-800">{{ style.name }}</p>
              <p class="text-xs text-warm-500">{{ style.slug }}</p>
            </div>
            <button
              class="p-1.5 text-warm-400 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
              @click="handleDelete(style.id, style.name)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <EmptyState
          v-else
          icon="lucide:palette"
          title="暂无风格"
          description="添加如现代、极简、新中式等风格。"
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
  if (!confirm(`确定要删除风格「${name}」吗？`)) return
  try {
    await remove(id)
    styles.value = await fetchAll()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>
