<template>
  <aside class="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30">
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-gray-800">
      <NuxtLink to="/admin" class="text-lg font-bold tracking-tight">STUDIO Admin</NuxtLink>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.to) ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'"
      >
        <Icon :name="item.icon" size="18" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- Back to site -->
    <div class="p-4 border-t border-gray-800">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <Icon name="lucide:external-link" size="16" />
        View Site
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { to: '/admin/projects', label: 'Projects', icon: 'lucide:folder-kanban' },
  { to: '/admin/categories', label: 'Categories', icon: 'lucide:folder-tree' },
  { to: '/admin/styles', label: 'Styles', icon: 'lucide:palette' },
]

function isActive(path: string) {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}
</script>
