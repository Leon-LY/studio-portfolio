<template>
  <aside class="w-64 bg-stone-900 text-canvas flex flex-col h-screen fixed left-0 top-0 z-30">
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-stone-700">
      <NuxtLink to="/admin" class="font-serif text-lg font-bold tracking-tight">方外设计 后台</NuxtLink>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors"
        :class="isActive(item.to) ? 'bg-stone-700 text-canvas border-l-2 border-accent-400' : 'text-stone-400 hover:text-canvas hover:bg-stone-800'"
      >
        <Icon :name="item.icon" size="18" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- 返回网站 -->
    <div class="p-4 border-t border-stone-700">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-canvas transition-colors rounded-sm hover:bg-stone-800"
      >
        <Icon name="lucide:external-link" size="16" />
        查看网站
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/admin', label: '仪表盘', icon: 'lucide:layout-dashboard' },
  { to: '/admin/projects', label: '项目', icon: 'lucide:folder-kanban' },
  { to: '/admin/payments', label: '回款管理', icon: 'lucide:receipt' },
  { to: '/admin/files', label: '文件管理', icon: 'lucide:folder-open' },
  { to: '/admin/categories', label: '分类', icon: 'lucide:folder-tree' },
  { to: '/admin/styles', label: '风格', icon: 'lucide:palette' },
  { to: '/admin/manual', label: '操作手册', icon: 'lucide:book-open' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>
