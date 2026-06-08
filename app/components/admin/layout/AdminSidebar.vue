<template>
  <aside
    class="w-64 bg-stone-900 text-canvas flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:z-30"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-14 px-4 lg:px-6 lg:h-16 border-b border-stone-700">
      <NuxtLink to="/admin" class="font-serif text-lg font-bold tracking-tight" @click="$emit('close')">方外设计 后台</NuxtLink>
      <button
        class="p-1 -mr-1 rounded-sm hover:bg-stone-700 transition-colors lg:hidden"
        aria-label="关闭菜单"
        @click="$emit('close')"
      >
        <Icon name="lucide:x" size="20" />
      </button>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 py-6 px-4 space-y-5 overflow-y-auto">
      <template v-for="group in navGroups" :key="group.label">
        <div>
          <p class="px-3 mb-2 text-[10px] font-medium text-stone-500 uppercase tracking-widest">{{ group.label }}</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors"
              :class="isActive(item.to) ? 'bg-stone-700 text-canvas border-l-2 border-accent-400' : 'text-stone-400 hover:text-canvas hover:bg-stone-800'"
              @click="$emit('close')"
            >
              <Icon :name="item.icon" size="18" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </template>
    </nav>

    <!-- 返回网站 -->
    <div class="p-4 border-t border-stone-700">
      <NuxtLink
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-canvas transition-colors rounded-sm hover:bg-stone-800"
      >
        <Icon name="lucide:external-link" size="16" />
        查看网站
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps({
  open: { type: Boolean, default: false },
})

defineEmits(['close'])

const route = useRoute()

const navGroups = [
  {
    label: '内容管理',
    items: [
      { to: '/admin', label: '仪表盘', icon: 'lucide:layout-dashboard' },
      { to: '/admin/projects', label: '项目', icon: 'lucide:folder-kanban' },
      { to: '/admin/projects/board', label: '看板', icon: 'lucide:kanban' },
      { to: '/admin/contacts', label: '留言', icon: 'lucide:inbox' },
    ],
  },
  {
    label: '资源管理',
    items: [
      { to: '/admin/payments', label: '回款管理', icon: 'lucide:receipt' },
      { to: '/admin/expenses', label: '支出管理', icon: 'lucide:banknote' },
      { to: '/admin/files', label: '文件管理', icon: 'lucide:folder-open' },
      { to: '/admin/categories', label: '分类', icon: 'lucide:folder-tree' },
      { to: '/admin/styles', label: '风格', icon: 'lucide:palette' },
    ],
  },
  {
    label: '系统设置',
    items: [
      { to: '/admin/settings', label: '站点设置', icon: 'lucide:settings' },
      { to: '/admin/users', label: '用户管理', icon: 'lucide:users' },
      { to: '/admin/manual', label: '操作手册', icon: 'lucide:book-open' },
    ],
  },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  if (path === '/admin/projects') return route.path.startsWith('/admin/projects') && route.path !== '/admin/projects/board'
  return route.path.startsWith(path)
}
</script>
