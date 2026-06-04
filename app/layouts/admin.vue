<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="lg:ml-64">
      <!-- Mobile header bar -->
      <div class="flex items-center gap-3 h-14 px-4 bg-stone-900 text-canvas lg:hidden">
        <button
          class="p-1.5 -ml-1 rounded-sm hover:bg-stone-700 transition-colors"
          aria-label="打开菜单"
          @click="sidebarOpen = true"
        >
          <Icon name="lucide:menu" size="22" />
        </button>
        <span class="font-serif font-bold text-sm tracking-tight">方外设计 后台</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/layout/AdminSidebar.vue'

const sidebarOpen = ref(false)

// Close sidebar on route change (mobile)
const route = useRoute()
watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})
</script>
