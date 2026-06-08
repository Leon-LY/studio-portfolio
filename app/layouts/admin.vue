<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <AdminSidebar :open="sidebarOpen" :collapsed="collapsed" @close="sidebarOpen = false" @toggle="collapsed = !collapsed" />

    <div :class="collapsed ? 'lg:ml-16' : 'lg:ml-64'" class="transition-all duration-300">
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
const collapsed = ref(false)

const route = useRoute()
watch(() => route.fullPath, () => { sidebarOpen.value = false })
</script>
